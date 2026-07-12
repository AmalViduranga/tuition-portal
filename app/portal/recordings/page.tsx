import { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { loadStudentRecordings } from "@/lib/recordings/student-recordings";
import StudentRecordingsClient from "./StudentRecordingsClient";

export const metadata: Metadata = {
  title: "Class Recordings | MathsLK",
  description: "Watch your A/L Mathematics class recordings, structured by theory and revision.",
};

type Props = {
  searchParams: Promise<{ highlight?: string }>;
};

export default async function RecordingsPage({ searchParams }: Props) {
  const { supabase, user } = await requireUser();
  const { highlight } = await searchParams;
  const initialData = await loadStudentRecordings(supabase, user.id, null);

  return <StudentRecordingsClient initialData={initialData} highlight={highlight} />;
}
