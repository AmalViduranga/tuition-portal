import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Recalculates and grants access to a student based on a specific payment period.
 * This should be called whenever a payment is APPROVED.
 */
export async function grantPaymentAccess(paymentPeriodId: string, adminId?: string) {
  const supabase = createAdminClient();

  // 1. Fetch payment details
  // We fetch basic details first, then TRY to join payment_plans if they exist
  const { data: payment, error: fetchErr } = await supabase
    .from("student_class_payment_periods")
    .select(`
      *,
      payment_plans (
        id,
        payment_plan_classes (
          class_id
        )
      )
    `)
    .eq("id", paymentPeriodId)
    .single();

  if (fetchErr || !payment) {
    if (fetchErr?.code === '42P01') {
       // Table missing, fallback to basic
       const basic = await supabase.from("student_class_payment_periods").select("*").eq("id", paymentPeriodId).single();
       if (basic.error || !basic.data) throw new Error("Payment record missing");
       await processAccessGrants(supabase, basic.data.student_id, [basic.data.class_id].filter(Boolean), basic.data.start_date, basic.data.end_date, adminId || basic.data.reviewed_by);
       return;
    }
    throw new Error("Payment not found");
  }

  if (payment.status !== "approved") return;

  const { student_id, class_id, start_date, end_date, payment_plans } = payment;

  // 2. Determine all class IDs covered by this payment
  let targetClassIds: string[] = [];
  if (class_id) targetClassIds.push(class_id);
  
  if (payment_plans && Array.isArray((payment_plans as any).payment_plan_classes)) {
    (payment_plans as any).payment_plan_classes.forEach((ppc: any) => {
      if (!targetClassIds.includes(ppc.class_id)) targetClassIds.push(ppc.class_id);
    });
  }

  if (targetClassIds.length === 0) return;

  await processAccessGrants(supabase, student_id, targetClassIds, start_date, end_date, adminId || payment.reviewed_by);
}

/** Internal helper for access granting logic */
async function processAccessGrants(supabase: any, student_id: string, classIds: string[], start: string, end: string, adminId?: string) {
  for (const tid of classIds) {
    // A. Recordings
    const { data: recordings } = await supabase.from("recordings").select("id").eq("class_id", tid).gte("release_at", start).lte("release_at", end);
    if (recordings && recordings.length > 0) {
      const grants = recordings.map((r: any) => ({ student_id, recording_id: r.id, granted_by: adminId || null, grant_type: "payment" }));
      await supabase.from("recording_manual_unlocks").upsert(grants, { onConflict: "student_id, recording_id", ignoreDuplicates: true });
    }
    // B. Materials
    const { data: materials } = await supabase.from("materials").select("id").eq("class_id", tid).gte("release_at", start).lte("release_at", end);
    if (materials && materials.length > 0) {
      const grants = materials.map((m: any) => ({ student_id, material_id: m.id, granted_by: adminId || null, grant_type: "payment" }));
      await supabase.from("material_manual_unlocks").upsert(grants, { onConflict: "student_id, material_id", ignoreDuplicates: true });
    }
  }
}

/**
 * Evaluates and grants access to eligible students when a new recording is published.
 */
export async function grantNewReleaseAccess(
  contentId: string,
  classId: string,
  releaseAt: string,
  contentType: "recording" | "material",
  adminId?: string
) {
  const supabase = createAdminClient();

  // 1. Find Students with Free-card
  const { data: freeCardEnrollments } = await supabase
    .from("student_class_enrollments")
    .select("student_id")
    .eq("class_id", classId)
    .eq("access_mode", "free_card")
    .lte("start_access_date", releaseAt)
    .or(`access_end_date.is.null,access_end_date.gte.${releaseAt}`);

  // 2. Find Students with Approved Payments for this class
  const { data: directPayments } = await supabase
    .from("student_class_payment_periods")
    .select("student_id")
    .eq("class_id", classId)
    .eq("status", "approved")
    .lte("start_date", releaseAt)
    .gte("end_date", releaseAt);

  // 3. Optional: Find Students with Plan-based access (handle missing tables safely)
  let planStudentIds: string[] = [];
  try {
     const { data: planPayments } = await supabase
      .from("student_class_payment_periods")
      .select(`
        student_id,
        payment_plans (
          payment_plan_classes (
            class_id
          )
        )
      `)
      .eq("status", "approved")
      .lte("start_date", releaseAt)
      .gte("end_date", releaseAt);
      
     if (planPayments) {
        planPayments.forEach((p: any) => {
            const hasClass = p.payment_plans?.payment_plan_classes?.some((c: any) => c.class_id === classId);
            if (hasClass) planStudentIds.push(p.student_id);
        });
     }
  } catch (e) {
     console.warn("Skipping plan-based access check (tables might be missing)");
  }

  const studentIdsToGrant: { id: string; type: string }[] = [];
  if (freeCardEnrollments) freeCardEnrollments.forEach((e) => studentIdsToGrant.push({ id: e.student_id, type: "free_card" }));
  if (directPayments) directPayments.forEach((p) => { if (!studentIdsToGrant.some(s => s.id === p.student_id)) studentIdsToGrant.push({ id: p.student_id, type: "payment" }); });
  planStudentIds.forEach(id => { if (!studentIdsToGrant.some(s => s.id === id)) studentIdsToGrant.push({ id, type: "payment" }); });

  if (studentIdsToGrant.length === 0) return;

  const targetTable = contentType === "recording" ? "recording_manual_unlocks" : "material_manual_unlocks";
  const idField = contentType === "recording" ? "recording_id" : "material_id";
  const grants = studentIdsToGrant.map((s) => ({ student_id: s.id, [idField]: contentId, granted_by: adminId || null, grant_type: s.type === "free_card" ? "free_card" : "payment" }));

  await supabase.from(targetTable).upsert(grants, { onConflict: `student_id, ${idField}`, ignoreDuplicates: true });
}

/**
 * Reprocesses ALL free-card grants for a student if their free_card status is added
 */
export async function syncFreeCardGrantsForStudent(
  studentId: string,
  classId: string,
  adminId?: string
) {
  const supabase = createAdminClient();

  const { data: enrollment } = await supabase
    .from("student_class_enrollments")
    .select("*")
    .eq("student_id", studentId)
    .eq("class_id", classId)
    .single();

  if (!enrollment || enrollment.access_mode !== "free_card") return;

  // 1. Get all materials matching
  let matQuery = supabase
    .from("materials")
    .select("id")
    .eq("class_id", classId)
    .gte("release_at", enrollment.start_access_date);

  if (enrollment.access_end_date) {
    matQuery = matQuery.lte("release_at", enrollment.access_end_date);
  }

  const { data: materials } = await matQuery;
  
  if (materials && materials.length > 0) {
    const grants = materials.map((m) => ({
      student_id: studentId,
      material_id: m.id,
      granted_by: adminId || null,
      grant_type: "free_card",
    }));
    await supabase.from("material_manual_unlocks").upsert(grants, {
      onConflict: "student_id, material_id",
      ignoreDuplicates: true,
    });
  }

  // 2. Get all recordings matching
  let recQuery = supabase
    .from("recordings")
    .select("id")
    .eq("class_id", classId)
    .gte("release_at", enrollment.start_access_date);

  if (enrollment.access_end_date) {
    recQuery = recQuery.lte("release_at", enrollment.access_end_date);
  }

  const { data: recordings } = await recQuery;

  if (recordings && recordings.length > 0) {
    const grants = recordings.map((r) => ({
      student_id: studentId,
      recording_id: r.id,
      granted_by: adminId || null,
      grant_type: "free_card",
    }));
    await supabase.from("recording_manual_unlocks").upsert(grants, {
      onConflict: "student_id, recording_id",
      ignoreDuplicates: true,
    });
  }
}

/**
 * Manually grant access to a specific piece of content
 */
export async function manualGrantAccess(
  studentId: string,
  contentId: string,
  contentType: "recording" | "material",
  adminId?: string
) {
  const supabase = createAdminClient();
  const targetTable = contentType === "recording" ? "recording_manual_unlocks" : "material_manual_unlocks";
  const idField = contentType === "recording" ? "recording_id" : "material_id";

  await supabase.from(targetTable).upsert({
    student_id: studentId,
    [idField]: contentId,
    granted_by: adminId || null,
    grant_type: "manual",
    revoked_at: null, // Clear any previous revocation
    revoke_reason: null,
  });
}

/**
 * Revoke access to a specific piece of content
 */
export async function revokeAccess(
  studentId: string,
  contentId: string,
  contentType: "recording" | "material",
  reason?: string
) {
  const supabase = createAdminClient();
  const targetTable = contentType === "recording" ? "recording_manual_unlocks" : "material_manual_unlocks";
  const idField = contentType === "recording" ? "recording_id" : "material_id";

  await supabase
    .from(targetTable)
    .update({ 
      revoked_at: new Date().toISOString(),
      revoke_reason: reason || "Manual revocation"
    })
    .eq("student_id", studentId)
    .eq(idField, contentId);
}
