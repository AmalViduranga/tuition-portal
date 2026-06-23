import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { grantPaymentAccess } from "@/lib/admin/grant-manager";
import { getErrorMessage } from "@/lib/utils/error";
import { createAuditLog } from "@/lib/audit/audit-log";

export async function GET() {
  try {
    const adminAuth = await requireAdminApi();
    if (!adminAuth.ok) return NextResponse.json({ error: adminAuth.error }, { status: adminAuth.status });
    const adminSupabase = createAdminClient();

    // Join profiles explicitly through student_id to avoid ambiguity with reviewed_by
    const { data, error } = await adminSupabase
      .from("student_class_payment_periods")
      .select(`
        *,
        student:profiles!student_id (full_name, phone),
        class_groups (name),
        payment_plans (id, name)
      `)
      .order("created_at", { ascending: false });

    if (error) {
       console.error("GET Payments Relation Error:", error);
       // Check if there is a relation error and try a safer fallback
       if (error.code === 'PGRST108' || error.message.includes("relationship")) {
          const { data: fallback, error: fallbackErr } = await adminSupabase
            .from("student_class_payment_periods")
            .select("*, student:profiles!student_id(full_name, phone)")
            .limit(100);
          if (fallbackErr) throw fallbackErr;
          return NextResponse.json(fallback || []);
       }
       throw error;
    }

    const formatted = (data || []).map((item: {
      id: string;
      student_id: string;
      student?: { full_name?: string; phone?: string } | { full_name?: string; phone?: string }[];
      class_id: string;
      class_groups?: { name?: string } | { name?: string }[];
      payment_plan_id?: string;
      payment_plans?: { name?: string } | { name?: string }[];
      amount_paid?: number;
      access_mode?: string;
      start_date: string;
      end_date: string;
      status: string;
      created_at: string;
    }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const getVal = (obj: any, field: string) => {
        if (!obj) return null;
        return Array.isArray(obj) ? obj[0]?.[field] : obj[field];
      };
      
      return {
        id: item.id,
        student_id: item.student_id,
        student_name: getVal(item.student, "full_name") || "Unknown",
        student_phone: getVal(item.student, "phone") || "",
        class_id: item.class_id,
        class_name: getVal(item.class_groups, "name") || getVal(item.payment_plans, "name") || "Multiple/N-A",
        payment_plan_id: item.payment_plan_id || null,
        plan_name: getVal(item.payment_plans, "name") || null,
        amount_paid: item.amount_paid || 0,
        access_mode: item.access_mode || "paid",
        start_date: item.start_date,
        end_date: item.end_date,
        status: item.status,
        created_at: item.created_at,
      };
    });

    return NextResponse.json(formatted);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminAuth = await requireAdminApi();
    if (!adminAuth.ok) return NextResponse.json({ error: adminAuth.error }, { status: adminAuth.status });
    const admin = adminAuth;
    const adminSupabase = createAdminClient();
    const formData = await request.formData();

    const studentId = String(formData.get("student_id") ?? "");
    const classId = formData.get("class_id") ? String(formData.get("class_id")) : null;
    const planId = formData.get("payment_plan_id") ? String(formData.get("payment_plan_id")) : null;
    const amountPaid = Number(formData.get("amount_paid") ?? 0);
    const accessMode = String(formData.get("access_mode") ?? "paid");
    const startDate = String(formData.get("start_date") ?? "");
    const endDate = String(formData.get("end_date") ?? "");
    const adminNote = String(formData.get("admin_note") ?? "");

    const quickApprove = formData.get("quick_approve") === "true";

    let finalStartDate = startDate;
    let finalEndDate = endDate;
    let finalStatus = "pending";

    if (quickApprove) {
      // Payment date = Approval date = Current date
      const start = new Date();
      // Calculate 1.5 months (45 days)
      const end = new Date(start);
      end.setDate(end.getDate() + 45);
      
      finalStartDate = start.toISOString().split("T")[0];
      finalEndDate = end.toISOString().split("T")[0];
      finalStatus = "approved";
    } else if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required fields (start_date, end_date)" },
        { status: 400 }
      );
    }

    // Insert payment record building object dynamically to be schema-safe
    const record: {
      student_id: string;
      class_id: string | null;
      start_date: string;
      end_date: string;
      status: string;
      admin_note: string;
      reviewed_by: string | null;
      reviewed_at: string | null;
      payment_plan_id?: string;
      amount_paid?: number;
      access_mode?: string;
    } = {
      student_id: studentId,
      class_id: classId,
      start_date: finalStartDate,
      end_date: finalEndDate,
      status: finalStatus,
      admin_note: adminNote,
      reviewed_by: finalStatus === "approved" ? admin.user!.id : null,
      reviewed_at: finalStatus === "approved" ? new Date().toISOString() : null,
    };

    // Only add new columns if they are not explicitly null/missing in typical logic
    // We'll put them in a separate block and try inserting them safely
    if (planId) record.payment_plan_id = planId;
    if (amountPaid) record.amount_paid = amountPaid;
    if (accessMode) record.access_mode = accessMode;

    const { data: inserted, error } = await adminSupabase
      .from("student_class_payment_periods")
      .insert(record)
      .select("id")
      .single();

    if (error) {
      console.error("POST Payment Submission Error:", error);
      // If we get "column does not exist", retry with minimal basic fields
      if (error.code === '42703') {
           const basicRecord = {
              student_id: studentId,
              class_id: classId,
              start_date: finalStartDate,
              end_date: finalEndDate,
              status: finalStatus,
              admin_note: adminNote,
           };
           const retry = await adminSupabase.from("student_class_payment_periods").insert(basicRecord).select("id").single();
           if (retry.error) throw retry.error;
           
           if (finalStatus === "approved") {
             await grantPaymentAccess(retry.data.id, admin.user!.id);
           }

           await createAuditLog({
             actorId: admin.user?.id,
             actorEmail: admin.user?.email,
             actorRole: "admin",
             action: finalStatus === "approved" ? "PAYMENT_APPROVED" : "PAYMENT_UPDATED",
             targetType: "payment_period",
             targetId: retry.data.id,
             metadata: { student_id: studentId, class_id: classId, amount_paid: amountPaid, status: finalStatus },
             request,
           });

           return NextResponse.json({ success: true, id: retry.data.id });
      }
      throw error;
    }
    
    // Trigger access granting if automatically approved
    if (finalStatus === "approved" && inserted) {
      await grantPaymentAccess(inserted.id, admin.user!.id);
    }

    await createAuditLog({
      actorId: admin.user?.id,
      actorEmail: admin.user?.email,
      actorRole: "admin",
      action: finalStatus === "approved" ? "PAYMENT_APPROVED" : "PAYMENT_UPDATED",
      targetType: "payment_period",
      targetId: inserted.id,
      metadata: { student_id: studentId, class_id: classId, amount_paid: amountPaid, status: finalStatus },
      request,
    });

    return NextResponse.json({ success: true, id: inserted.id });
  } catch (error: unknown) {
    console.error("Payment Submission Server Error:", error);
    return NextResponse.json(
      { error: getErrorMessage(error), details: error },
      { status: 500 }
    );
  }
}

