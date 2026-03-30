import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const adminSupabase = createAdminClient();
    
    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get("month") || "");
    const year = parseInt(searchParams.get("year") || "");

    if (isNaN(month) || isNaN(year)) {
      return NextResponse.json({ error: "Invalid month or year" }, { status: 400 });
    }

    // Define date range for the month
    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    // Fetch all approved/records for this month (using start_date as payment/approval date)
    const { data: records, error } = await adminSupabase
      .from("student_class_payment_periods")
      .select(`
        id,
        student_id,
        class_id,
        payment_plan_id,
        amount_paid,
        access_mode,
        start_date,
        end_date,
        status,
        admin_note,
        profiles (full_name, phone),
        class_groups (name),
        payment_plans (name)
      `)
      .eq("status", "approved")
      .gte("start_date", startDate)
      .lte("start_date", endDate)
      .order("start_date", { ascending: true });

    if (error) throw error;

    // Process records into class-wise groups
    const classGroups: Record<string, {
      name: string;
      rows: any[];
      paidCount: number;
      freeCardCount: number;
      totalIncome: number;
    }> = {};

    let totalPaidStudents = 0;
    let totalFreeCardStudents = 0;
    let totalMonthlyIncome = 0;

    (records || []).forEach((rec: any) => {
      const className = rec.class_groups?.name || rec.payment_plans?.name || "Other / Bundles";
      const key = rec.class_id || rec.payment_plan_id || "other";

      if (!classGroups[key]) {
        classGroups[key] = {
          name: className,
          rows: [],
          paidCount: 0,
          freeCardCount: 0,
          totalIncome: 0,
        };
      }

      const row = {
        student_name: rec.profiles?.full_name,
        phone: rec.profiles?.phone,
        class_name: className,
        payment_date: rec.start_date,
        expiry_date: rec.end_date,
        amount: rec.amount_paid || 0,
        mode: rec.access_mode,
        status: rec.status,
        notes: rec.admin_note,
      };

      classGroups[key].rows.push(row);

      if (rec.access_mode === "paid") {
        classGroups[key].paidCount++;
        classGroups[key].totalIncome += Number(rec.amount_paid || 0);
        totalPaidStudents++;
        totalMonthlyIncome += Number(rec.amount_paid || 0);
      } else if (rec.access_mode === "free_card") {
        classGroups[key].freeCardCount++;
        totalFreeCardStudents++;
      }
    });

    return NextResponse.json({
      summary: {
        totalPaidStudents,
        totalFreeCardStudents,
        totalMonthlyIncome,
        month,
        year
      },
      classGroups: Object.values(classGroups)
    });

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
