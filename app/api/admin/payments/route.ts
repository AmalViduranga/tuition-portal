import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { grantPaymentAccess } from "@/lib/admin/grant-manager";

export async function GET() {
  try {
    await requireAdmin();
    const adminSupabase = createAdminClient();

    const { data, error } = await adminSupabase
      .from("student_class_payment_periods")
      .select(`
        id,
        student_id,
        class_id,
        start_date,
        end_date,
        status,
        created_at,
        profiles:profiles!payment_reviews_student_id_fkey (full_name),
        class_groups (name)
      `)
      .order("start_date", { ascending: false });

    if (error) throw error;

    const formatted = (data || []).map((item: any) => ({
      id: item.id,
      student_id: item.student_id,
      student_name: Array.isArray(item.profiles) ? item.profiles[0]?.full_name : item.profiles?.full_name,
      class_id: item.class_id,
      class_name: Array.isArray(item.class_groups) ? item.class_groups[0]?.name : item.class_groups?.name,
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
    await requireAdmin();
    const adminSupabase = createAdminClient();
    const formData = await request.formData();

    const studentId = String(formData.get("student_id") ?? "");
    const classId = String(formData.get("class_id") ?? "");
    const startDate = String(formData.get("start_date") ?? "");
    const endDate = String(formData.get("end_date") ?? "");

    const quickApprove = formData.get("quick_approve") === "true";

    let finalStartDate = startDate;
    let finalEndDate = endDate;
    let finalStatus = "pending";

    if (quickApprove) {
      const start = new Date();
      // Calculate 1.5 months from today (45 days avg)
      const end = new Date(start);
      end.setDate(end.getDate() + 45);
      
      finalStartDate = start.toISOString().split("T")[0];
      finalEndDate = end.toISOString().split("T")[0];
      finalStatus = "approved";
    } else if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Set status to pending by default or approved if quick_approve
    const { data: inserted, error } = await adminSupabase.from("student_class_payment_periods").insert({
      student_id: studentId,
      class_id: classId,
      start_date: finalStartDate,
      end_date: finalEndDate,
      status: finalStatus,
    }).select("id").single();

    if (error) throw error;
    
    // Trigger access granting if automatically approved
    if (finalStatus === "approved" && inserted) {
      await grantPaymentAccess(inserted.id, (await requireAdmin()).user.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
