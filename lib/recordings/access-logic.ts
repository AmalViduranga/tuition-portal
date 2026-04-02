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

  // 2. Fallback dynamic evaluation
  // Check if any enrollment window (45 days) covers the item's release date
  const hasValidEnrollment = context.enrollments.some((e) => {
    if (e.class_id !== item.class_id) return false;
    
    const start = e.start_access_date;
    // If access_end_date is missing, fall back to start + 45 days
    let end = e.access_end_date;
    if (!end) {
      const d = new Date(start);
      d.setDate(d.getDate() + 45);
      end = d.toISOString().split("T")[0];
    }
    
    return item.release_at >= start && item.release_at <= end;
  });

  if (hasValidEnrollment) return true;

  // 3. Check payment periods (keeping for backward compatibility if data exists here)
  const hasValidPayment = context.paymentPeriods.some(
    (p) => p.class_id === item.class_id && p.status === "approved" && p.start_date <= item.release_at && p.end_date >= item.release_at
  );

  if (hasValidPayment) return true;

  return false;
}

/**
 * Checks if a student currently has ACTIVE access to a class.
 * (Meaning they can view current/new content)
 */
export function isClassAccessActive(classId: string, context: AccessContext): boolean {
  const today = new Date().toISOString().split("T")[0];

  // 1. Check enrollment windows
  const hasActiveEnrollment = context.enrollments.some((e) => {
    if (e.class_id !== classId) return false;
    
    const start = e.start_access_date;
    let end = e.access_end_date;
    if (!end) {
      const d = new Date(start);
      d.setDate(d.getDate() + 45);
      end = d.toISOString().split("T")[0];
    }
    
    return today >= start && today <= end;
  });

  if (hasActiveEnrollment) return true;

  // 2. Check approved payment periods
  const hasActivePayment = context.paymentPeriods.some(
    (p) => p.class_id === classId && p.status === "approved" && p.start_date <= today && p.end_date >= today
  );

  return hasActivePayment;
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
