import { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { loadStudentRecordings } from "@/lib/recordings/student-recordings";
import StudentRecordingsClient from "./StudentRecordingsClient";

export const metadata: Metadata = {
  title: "Class Recordings | MathsLK",
  description: "Watch your A/L Mathematics class recordings, structured by theory and revision.",
};

type Props = {
  searchParams: Promise<{
    class_id?: string | string[];
    highlight?: string | string[];
  }>;
};

function firstParam(value: string | string[] | undefined): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  const trimmed = raw?.trim();
  return trimmed ? trimmed : undefined;
}

export default async function RecordingsPage({ searchParams }: Props) {
  const { supabase, user } = await requireUser();
  const params = await searchParams;
  const classId = firstParam(params.class_id);
  const highlight = firstParam(params.highlight);
  const initialData = await loadStudentRecordings(supabase, user.id, classId ?? null);

  return (
    <StudentRecordingsClient
      initialData={initialData}
      initialClassId={classId ?? ""}
      highlight={highlight}
    />
  );
}
