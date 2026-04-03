import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { grantPaymentAccess } from "@/lib/admin/grant-manager";

export async function GET() {
  try {
    await requireAdmin();
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

    const formatted = (data || []).map((item: any) => ({
      id: item.id,
      student_id: item.student_id,
      student_name: item.student?.full_name || "Unknown",
      student_phone: item.student?.phone || "",
      class_id: item.class_id,
      class_name: item.class_groups?.name || item.payment_plans?.name || "Multiple/N-A",
      payment_plan_id: item.payment_plan_id || null,
      plan_name: item.payment_plans?.name || null,
      amount_paid: item.amount_paid || 0,
      access_mode: item.access_mode || "paid",
      start_date: item.start_date,
      end_date: item.end_date,
      status: item.status,
      created_at: item.created_at,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
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
    const record: Record<string, any> = {
      student_id: studentId,
      class_id: classId,
      start_date: finalStartDate,
      end_date: finalEndDate,
      status: finalStatus,
      admin_note: adminNote,
      reviewed_by: finalStatus === "approved" ? admin.user.id : null,
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
           return NextResponse.json({ success: true, id: retry.data.id });
      }
      throw error;
    }
    
    // Trigger access granting if automatically approved
    if (finalStatus === "approved" && inserted) {
      await grantPaymentAccess(inserted.id, admin.user.id);
    }

    return NextResponse.json({ success: true, id: inserted.id });
  } catch (error: any) {
    console.error("Payment Submission Server Error:", error);
    const message = error?.message || error?.details || (typeof error === 'string' ? error : "Unknown error");
    return NextResponse.json(
      { error: message, details: error },
      { status: 500 }
    );
  }
}

