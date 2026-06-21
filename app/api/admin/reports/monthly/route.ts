import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const adminAuth = await requireAdminApi();
    if (!adminAuth.ok) return NextResponse.json({ error: adminAuth.error }, { status: adminAuth.status });
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
      rows: {
        id: string;
        student_name?: string;
        phone?: string;
        class_name: string;
        payment_date?: string;
        expiry_date?: string;
        amount: number;
        mode?: string;
        status?: string;
        notes?: string;
      }[];
      paidCount: number;
      freeCardCount: number;
      totalIncome: number;
    }> = {};

    let totalPaidStudents = 0;
    let totalFreeCardStudents = 0;
    let totalMonthlyIncome = 0;

    (records || []).forEach((rec: { id: string; class_groups?: { name?: string } | { name?: string }[]; payment_plans?: { name?: string } | { name?: string }[]; class_id?: string; payment_plan_id?: string; profiles?: { full_name?: string; phone?: string } | { full_name?: string; phone?: string }[]; start_date?: string; end_date?: string; amount_paid?: number; access_mode?: string; status?: string; admin_note?: string }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const getVal = (obj: any, field: string) => {
        if (!obj) return null;
        return Array.isArray(obj) ? obj[0]?.[field] : obj[field];
      };

      const className = getVal(rec.class_groups, "name") || getVal(rec.payment_plans, "name") || "Other / Bundles";
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
        id: rec.id,
        student_name: getVal(rec.profiles, "full_name"),
        phone: getVal(rec.profiles, "phone"),
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
