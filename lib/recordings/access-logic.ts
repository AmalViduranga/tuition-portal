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
  recordingGrants: Set<string>; // set of recording IDs granted access
  materialGrants: Set<string>; // set of material IDs granted access
  enrollments: Array<{ class_id: string; access_mode: string; start_access_date: string; access_end_date: string | null }>;
  paymentPeriods: Array<{ class_id: string; start_date: string; end_date: string; status: string }>;
};

export function isItemAccessible(
  item: { id: string; class_id: string; release_at: string; published: boolean },
  context: AccessContext,
  itemType: "recording" | "material"
): boolean {
  if (!item.published) return false;

  const grants = itemType === "recording" ? context.recordingGrants : context.materialGrants;
  
  // 1. Explicitly granted (covers manual unlocks, and successful event-based grants)
  if (grants.has(item.id)) return true;

  // 2. Fallback dynamic evaluation (in case event-based grants failed or weren't backfilled)
  const enrollment = context.enrollments.find((e) => e.class_id === item.class_id);
  if (!enrollment) return false;

  if (enrollment.start_access_date > item.release_at) return false;

  if (enrollment.access_mode === "free_card") {
    if (!enrollment.access_end_date || enrollment.access_end_date >= item.release_at) {
      return true;
    }
  }

  const validPayment = context.paymentPeriods.find(
    (p) => p.class_id === item.class_id && p.status === "approved" && p.start_date <= item.release_at && p.end_date >= item.release_at
  );

  if (validPayment) return true;

  return false;
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
  const [recGrantsRes, matGrantsRes, enrollRes, payRes] = await Promise.all([
    supabase.from("recording_manual_unlocks").select("recording_id").eq("student_id", studentId).is("revoked_at", null),
    supabase.from("material_manual_unlocks").select("material_id").eq("student_id", studentId).is("revoked_at", null),
    supabase.from("student_class_enrollments").select("class_id, access_mode, start_access_date, access_end_date").eq("student_id", studentId),
    supabase.from("student_class_payment_periods").select("class_id, start_date, end_date, status").eq("student_id", studentId)
  ]);

  return {
    recordingGrants: new Set((recGrantsRes.data || []).map((u) => u.recording_id)),
    materialGrants: new Set((matGrantsRes.data || []).map((u) => u.material_id)),
    enrollments: enrollRes.data || [],
    paymentPeriods: payRes.data || [],
  };
}
