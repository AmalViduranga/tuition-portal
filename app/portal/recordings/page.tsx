import { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { loadStudentRecordings } from "@/lib/recordings/student-recordings";
import StudentRecordingsClient from "./StudentRecordingsClient";

export const metadata: Metadata = {
  title: "Class Recordings | MathsLK",
  description: "Watch your A/L Mathematics class recordings, structured by theory and revision.",
};

export default async function RecordingsPage() {
  const { supabase, user } = await requireUser();
  const initialData = await loadStudentRecordings(supabase, user.id, null);

  return <StudentRecordingsClient initialData={initialData} />;
}
