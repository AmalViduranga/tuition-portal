import { requireUser } from "@/lib/auth";
import { loadStudentRecordings } from "@/lib/recordings/student-recordings";
import StudentRecordingsClient from "./StudentRecordingsClient";

export default async function RecordingsPage() {
  const { supabase, user } = await requireUser();
  const initialData = await loadStudentRecordings(supabase, user.id, null);

  return <StudentRecordingsClient initialData={initialData} />;
}
