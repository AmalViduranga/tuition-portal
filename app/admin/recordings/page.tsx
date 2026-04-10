import AdminRecordingsClient from "./AdminRecordingsClient";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminRecordingsPage() {
  await requireAdmin();
  const adminSupabase = createAdminClient();
  
  const [recordingsResponse, classesResponse] = await Promise.all([
     adminSupabase
      .from("recordings")
      .select(`
        id,
        title,
        description,
        youtube_video_id,
        release_at,
        published,
        thumbnail_url,
        views_count,
        class_groups (id, name),
        created_at
      `)
      .order("release_at", { ascending: false }),
     adminSupabase
       .from("class_groups")
       .select("id, name, description, is_active, created_at")
       .eq("is_active", true)
       .order("name", { ascending: true })
  ]);
  
  if (recordingsResponse.error) {
     console.error(recordingsResponse.error);
     return <div>Error loading recordings.</div>;
  }
  
  if (classesResponse.error) {
     console.error(classesResponse.error);
     return <div>Error loading classes.</div>;
  }

  return <AdminRecordingsClient initialRecordings={recordingsResponse.data || []} initialClasses={classesResponse.data || []} />;
}
