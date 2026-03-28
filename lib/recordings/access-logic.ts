import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Access Logic for Recordings
 * 
 * Business Rules:
 * 1. Admin manually reviews student payments outside the website
 * 2. Admin sets a paid access period for a student per class
 * 3. A student should get access to recordings released during the approved paid period
 * 4. Previously unlocked recordings must remain accessible forever
 * 5. If payment expires, student must not access newly released recordings after expiry
 * 6. New students can have a start_access_date per class
 * 7. Admin can manually unlock selected recordings even if they are outside the default access period
 * 8. Access should be checked securely on the server side
 */

export type AccessContext = {
  enrollments: Array<{ class_id: string; start_access_date: string }>;
  paymentPeriods: Array<{ class_id: string; start_date: string; end_date: string; status: string }>;
  manualUnlocks: Set<string>; // set of recording IDs manually unlocked
  materialUnlocks: Set<string>; // set of material IDs manually unlocked
};

/**
 * Determines if a student can access a specific item (recording or material) based on business rules.
 */
export function isItemAccessible(
  item: { id: string; class_id: string; release_at: string; published: boolean },
  context: AccessContext,
  itemType: "recording" | "material"
): boolean {
  if (!item.published) return false;

  const enrollment = context.enrollments.find((e) => e.class_id === item.class_id);
  if (!enrollment) return false;

  const releaseAt = new Date(item.release_at).toISOString().split("T")[0];
  const startAccess = new Date(enrollment.start_access_date).toISOString().split("T")[0];

  const unlocks = itemType === "recording" ? context.manualUnlocks : context.materialUnlocks;
  if (unlocks.has(item.id)) {
    return true;
  }

  if (releaseAt < startAccess) {
    return false;
  }

  const hasValidPaymentPeriod = context.paymentPeriods.some((period) => {
    if (period.class_id !== item.class_id) return false;
    if (period.status !== "approved") return false;
    
    const pStart = new Date(period.start_date).toISOString().split("T")[0];
    const pEnd = new Date(period.end_date).toISOString().split("T")[0];
    
    return releaseAt >= pStart && releaseAt <= pEnd;
  });

  return hasValidPaymentPeriod;
}

// Keep backward compatibility for existing code
export function isRecordingAccessible(
  recording: { id: string; class_id: string; release_at: string; published: boolean },
  context: AccessContext
): boolean {
  return isItemAccessible(recording, context, "recording");
}

export async function getStudentAccessContext(
  supabase: SupabaseClient, 
  studentId: string
): Promise<AccessContext> {
  const { data: enrollments } = await supabase
    .from("student_class_enrollments")
    .select("class_id, start_access_date")
    .eq("student_id", studentId);

  const { data: paymentPeriods } = await supabase
    .from("student_class_payment_periods")
    .select("class_id, start_date, end_date, status")
    .eq("student_id", studentId);

  const { data: manualUnlocksDb } = await supabase
    .from("recording_manual_unlocks")
    .select("recording_id")
    .eq("student_id", studentId);

  const { data: materialUnlocksDb } = await supabase
    .from("material_manual_unlocks")
    .select("material_id")
    .eq("student_id", studentId);

  return {
    enrollments: enrollments || [],
    paymentPeriods: paymentPeriods || [],
    manualUnlocks: new Set((manualUnlocksDb || []).map((u) => u.recording_id)),
    materialUnlocks: new Set((materialUnlocksDb || []).map((u) => u.material_id)),
  };
}
