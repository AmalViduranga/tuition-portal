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
};

export function isItemAccessible(
  item: { id: string; class_id: string; release_at: string; published: boolean },
  context: AccessContext,
  itemType: "recording" | "material"
): boolean {
  if (!item.published) return false;

  const grants = itemType === "recording" ? context.recordingGrants : context.materialGrants;
  return grants.has(item.id);
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
  const { data: recordingGrantsDb } = await supabase
    .from("recording_manual_unlocks")
    .select("recording_id")
    .eq("student_id", studentId)
    .is("revoked_at", null);

  const { data: materialGrantsDb } = await supabase
    .from("material_manual_unlocks")
    .select("material_id")
    .eq("student_id", studentId)
    .is("revoked_at", null);

  return {
    recordingGrants: new Set((recordingGrantsDb || []).map((u) => u.recording_id)),
    materialGrants: new Set((materialGrantsDb || []).map((u) => u.material_id)),
  };
}
