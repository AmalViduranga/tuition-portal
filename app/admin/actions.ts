"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function createStudent(formData: FormData) {
  await requireAdmin();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "");

  const adminClient = createAdminClient();
  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (error) throw new Error(error.message);

  await adminClient.from("profiles").upsert({
    id: data.user.id,
    full_name: fullName,
    role: "student",
  });
  revalidatePath("/admin/students");
}

export async function createClass(formData: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("class_groups").insert({
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
    is_active: true,
  });
  revalidatePath("/admin/classes");
}

export async function addRecording(formData: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("recordings").insert({
    class_id: String(formData.get("class_id") ?? ""),
    title: String(formData.get("title") ?? ""),
    youtube_video_id: String(formData.get("youtube_video_id") ?? ""),
    release_at: String(formData.get("release_at") ?? ""),
  });
  revalidatePath("/admin/recordings");
}

export async function addMaterial(formData: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("materials").insert({
    class_id: String(formData.get("class_id") ?? ""),
    title: String(formData.get("title") ?? ""),
    file_url: String(formData.get("file_url") ?? ""),
    release_at: String(formData.get("release_at") ?? ""),
  });
  revalidatePath("/admin/materials");
}

export async function addEnrollment(formData: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("student_class_enrollments").upsert({
    student_id: String(formData.get("student_id") ?? ""),
    class_id: String(formData.get("class_id") ?? ""),
    start_access_date: String(formData.get("start_access_date") ?? ""),
  });
  revalidatePath("/admin/enrollments");
}

export async function addPaymentPeriod(formData: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("student_class_payment_periods").insert({
    student_id: String(formData.get("student_id") ?? ""),
    class_id: String(formData.get("class_id") ?? ""),
    start_date: String(formData.get("start_date") ?? ""),
    end_date: String(formData.get("end_date") ?? ""),
  });
  revalidatePath("/admin/enrollments");
}

export async function addManualRecordingUnlock(formData: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("recording_manual_unlocks").insert({
    student_id: String(formData.get("student_id") ?? ""),
    recording_id: String(formData.get("recording_id") ?? ""),
  });
  revalidatePath("/admin/enrollments");
}

export async function addManualMaterialUnlock(formData: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("material_manual_unlocks").insert({
    student_id: String(formData.get("student_id") ?? ""),
    material_id: String(formData.get("material_id") ?? ""),
  });
  revalidatePath("/admin/enrollments");
}
