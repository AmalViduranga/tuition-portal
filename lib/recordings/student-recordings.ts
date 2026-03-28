import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

export type StudentRecordingRow = {
  id: string;
  title: string;
  description: string | null;
  youtube_video_id: string;
  release_at: string;
  published: boolean;
  thumbnail_url: string | null;
  class_id: string;
  class_groups: { id: string; name: string } | null;
  views_count: number | null;
};

export type AccessibleClass = { id: string; name: string };

export type StudentRecordingsPayload = {
  recordings: Array<
    StudentRecordingRow & {
      is_manually_unlocked: boolean;
    }
  >;
  accessible_classes: AccessibleClass[];
};

/**
 * Loads recordings the current user may see. Row Level Security on `recordings`
 * enforces enrollment + payment / manual unlock rules; we only add schedule gates
 * (published, release date) so unreleased items never appear in the list.
 */
export async function loadStudentRecordings(
  supabase: SupabaseClient,
  userId: string,
  classIdFilter?: string | null,
): Promise<StudentRecordingsPayload> {
  const today = new Date().toISOString().split("T")[0];

  const { data: enrollments, error: enrollError } = await supabase
    .from("student_class_enrollments")
    .select(
      `
      class_id,
      start_access_date,
      class_groups (
        id,
        name,
        is_active
      )
    `,
    )
    .eq("student_id", userId);

  if (enrollError) throw enrollError;

  const accessible_classes: AccessibleClass[] = [];

  enrollments?.forEach((enrollment) => {
    const classGroup = Array.isArray(enrollment.class_groups)
      ? enrollment.class_groups[0]
      : enrollment.class_groups;

    if (classGroup?.is_active && enrollment.start_access_date <= today) {
      accessible_classes.push({
        id: classGroup.id,
        name: classGroup.name,
      });
    }
  });

  if (classIdFilter && !accessible_classes.some((c) => c.id === classIdFilter)) {
    return { recordings: [], accessible_classes };
  }

  // To securely enforce access logic on the server side:
  // We fetch ALL published and released recordings for the student's enrolled classes
  // and THEN apply the explicit business logic via isRecordingAccessible.
  const adminDb = createAdminClient();
  let query = adminDb
    .from("recordings")
    .select(
      `
      id,
      title,
      description,
      youtube_video_id,
      release_at,
      published,
      thumbnail_url,
      class_id,
      class_groups (id, name),
      views_count
    `,
    )
    .eq("published", true)
    .lte("release_at", today)
    .in("class_id", accessible_classes.map((c) => c.id))
    .order("release_at", { ascending: false });

  if (classIdFilter) {
    query = query.eq("class_id", classIdFilter);
  }

  const { data: rawRecordings, error: recError } = await query;

  if (recError) throw recError;

  // Import our dedicated business logic code dynamically to avoid circular dependencies
  const { isRecordingAccessible, getStudentAccessContext } = await import("./access-logic");
  
  // Get full access context (enrollments, payment periods, unlocks) for evaluating the rules
  const accessContext = await getStudentAccessContext(supabase, userId);

  // Filter securely on the server side based on business rules
  const accessibleRecordings = (rawRecordings || []).filter((rec) => 
    isRecordingAccessible(rec, accessContext)
  );

  const list = accessibleRecordings.map((rec) => ({
    ...rec,
    class_groups: Array.isArray(rec.class_groups) ? rec.class_groups[0] : rec.class_groups,
    is_manually_unlocked: accessContext.recordingGrants.has(rec.id),
  }));

  return {
    recordings: list,
    accessible_classes,
  };
}
