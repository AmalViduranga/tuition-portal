"use server";

import { revalidatePath } from "next/cache";
import { createStudentAccount } from "@/lib/admin/create-student-account";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function createStudent(formData: FormData) {
  await requireAdmin();

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "");
  const phone = String(formData.get("phone") ?? "");
  const startAccessDate = String(formData.get("start_access_date") ?? "");
  const mustChangePassword = formData.get("must_change_password") === "on";

  const classIds = formData
    .getAll("class_ids")
    .map((id) => String(id).trim())
    .filter(Boolean);

  const result = await createStudentAccount({
    email,
    password,
    fullName,
    phone,
    classIds,
    startAccessDate,
    mustChangePassword,
  });

  if (result.ok) {
    revalidatePath("/admin/students");
    revalidatePath("/admin/enrollments");
  }

  return result;
}

export async function toggleStudentStatus(formData: FormData) {
  const { supabase } = await requireAdmin();
  const studentId = String(formData.get("student_id") ?? "");
  const isActive = formData.get("is_active") === "true";
  await supabase
    .from("profiles")
    .update({ is_active: !isActive })
    .eq("id", studentId);

  revalidatePath("/admin/students");
}

export async function deleteStudent(formData: FormData) {
  const { supabase } = await requireAdmin();
  const studentId = String(formData.get("student_id") ?? "");

  // Soft delete: set is_active to false
  await supabase
    .from("profiles")
    .update({ is_active: false })
    .eq("id", studentId);

  revalidatePath("/admin/students");
}

export async function updateStudent(formData: FormData) {
  await requireAdmin();
  const studentId = String(formData.get("student_id") ?? "");
  const fullName = String(formData.get("full_name") ?? "");
  const email = String(formData.get("email") ?? "").trim();

  const adminClient = createAdminClient();

  await adminClient.from("profiles").update({
    full_name: fullName,
  }).eq("id", studentId);

  if (email) {
    await adminClient.auth.admin.updateUserById(studentId, { email });
  }

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

export async function updateClass(formData: FormData) {
  const { supabase } = await requireAdmin();
  const classId = String(formData.get("class_id") ?? "");
  const name = String(formData.get("name") ?? "");
  const description = String(formData.get("description") ?? "");
  await supabase
    .from("class_groups")
    .update({ name, description })
    .eq("id", classId);

  revalidatePath("/admin/classes");
}

export async function toggleClassStatus(formData: FormData) {
  const { supabase } = await requireAdmin();
  const classId = String(formData.get("class_id") ?? "");

  // Get current status
  const { data: classData } = await supabase
    .from("class_groups")
    .select("is_active")
    .eq("id", classId)
    .single();

  await supabase
    .from("class_groups")
    .update({ is_active: !classData?.is_active })
    .eq("id", classId);

  revalidatePath("/admin/classes");
}

export async function addRecording(formData: FormData) {
  const { supabase } = await requireAdmin();
  const file = formData.get("thumbnail") as File | null;
  let thumbnailUrl = null;

  // Upload thumbnail if provided
  if (file && file.size > 0) {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `recordings/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("thumbnails")
      .upload(filePath, file, { upsert: false });

    if (uploadError) throw new Error(`Thumbnail upload failed: ${uploadError.message}`);

    const { data: { publicUrl } } = supabase.storage
      .from("thumbnails")
      .getPublicUrl(filePath);

    thumbnailUrl = publicUrl;
  }

  await supabase.from("recordings").insert({
    class_id: String(formData.get("class_id") ?? ""),
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    youtube_video_id: String(formData.get("youtube_video_id") ?? ""),
    release_at: String(formData.get("release_at") ?? ""),
    published: formData.get("published") === "on",
    thumbnail_url: thumbnailUrl,
  });
  revalidatePath("/admin/recordings");
}

export async function updateRecording(formData: FormData) {
  const { supabase } = await requireAdmin();
  const recordingId = String(formData.get("recording_id") ?? "");

  const updateData: Record<string, any> = {
    class_id: String(formData.get("class_id") ?? ""),
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    youtube_video_id: String(formData.get("youtube_video_id") ?? ""),
    release_at: String(formData.get("release_at") ?? ""),
    published: formData.get("published") === "on",
  };

  // Handle thumbnail upload
  const file = formData.get("thumbnail") as File | null;
  if (file && file.size > 0) {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `recordings/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("thumbnails")
      .upload(filePath, file, { upsert: false });

    if (uploadError) throw new Error(`Thumbnail upload failed: ${uploadError.message}`);

    const { data: { publicUrl } } = supabase.storage
      .from("thumbnails")
      .getPublicUrl(filePath);

    updateData.thumbnail_url = publicUrl;
  }

  await supabase
    .from("recordings")
    .update(updateData)
    .eq("id", recordingId);

  revalidatePath("/admin/recordings");
}

export async function toggleRecordingStatus(formData: FormData) {
  const { supabase } = await requireAdmin();
  const recordingId = String(formData.get("recording_id") ?? "");

  const { data: recording } = await supabase
    .from("recordings")
    .select("published")
    .eq("id", recordingId)
    .single();

  await supabase
    .from("recordings")
    .update({ published: !recording?.published })
    .eq("id", recordingId);

  revalidatePath("/admin/recordings");
}

export async function deleteRecording(formData: FormData) {
  const { supabase } = await requireAdmin();
  const recordingId = String(formData.get("recording_id") ?? "");

  await supabase.from("recordings").delete().eq("id", recordingId);

  revalidatePath("/admin/recordings");
}

export async function addMaterial(formData: FormData) {
  const { supabase } = await requireAdmin();
  const file = formData.get("file") as File | null;

  if (!file || file.size === 0) {
    throw new Error("Please select a file to upload");
  }

  const materialType = String(formData.get("material_type") ?? "other");
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `materials/${fileName}`;

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from("materials")
    .upload(filePath, file, {
      upsert: false,
      contentType: file.type || "application/pdf",
    });

  if (uploadError) {
    throw new Error(`File upload failed: ${uploadError.message}`);
  }

  // Get signed URL (valid for 1 hour by default)
  const { data: { publicUrl } } = supabase.storage
    .from("materials")
    .getPublicUrl(filePath);

  await supabase.from("materials").insert({
    class_id: String(formData.get("class_id") ?? ""),
    title: String(formData.get("title") ?? ""),
    file_url: publicUrl,
    file_size: file.size,
    file_type: file.type || "application/pdf",
    material_type: materialType,
    release_at: String(formData.get("release_at") ?? ""),
    published: formData.get("published") === "on",
  });

  revalidatePath("/admin/materials");
}

export async function updateMaterial(formData: FormData) {
  const { supabase } = await requireAdmin();
  const materialId = String(formData.get("material_id") ?? "");

  const updateData: Record<string, any> = {
    class_id: String(formData.get("class_id") ?? ""),
    title: String(formData.get("title") ?? ""),
    material_type: String(formData.get("material_type") ?? "other"),
    release_at: String(formData.get("release_at") ?? ""),
    published: formData.get("published") === "on",
  };

  // Handle new file upload if provided
  const file = formData.get("file") as File | null;
  if (file && file.size > 0) {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `materials/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("materials")
      .upload(filePath, file, {
        upsert: false,
        contentType: file.type || "application/pdf",
      });

    if (uploadError) throw new Error(`File upload failed: ${uploadError.message}`);

    const { data: { publicUrl } } = supabase.storage
      .from("materials")
      .getPublicUrl(filePath);

    updateData.file_url = publicUrl;
    updateData.file_size = file.size;
    updateData.file_type = file.type || "application/pdf";
  }

  await supabase
    .from("materials")
    .update(updateData)
    .eq("id", materialId);

  revalidatePath("/admin/materials");
}

export async function toggleMaterialStatus(formData: FormData) {
  const { supabase } = await requireAdmin();
  const materialId = String(formData.get("material_id") ?? "");

  const { data: material } = await supabase
    .from("materials")
    .select("published")
    .eq("id", materialId)
    .single();

  await supabase
    .from("materials")
    .update({ published: !material?.published })
    .eq("id", materialId);

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
    status: "approved",
  });
  revalidatePath("/admin/enrollments");
}

export async function updatePaymentPeriodStatus(formData: FormData) {
  const { supabase } = await requireAdmin();
  const periodId = String(formData.get("period_id") ?? "");
  const status = String(formData.get("status") ?? "pending");
  await supabase
    .from("student_class_payment_periods")
    .update({ status })
    .eq("id", periodId);

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

// Site content management
export async function updateSiteContent(formData: FormData) {
  await requireAdmin();
  const { supabase } = await requireAdmin();

  const updates = [
    { key: "site_name", value: String(formData.get("site_name") ?? "") },
    { key: "teacher_name", value: String(formData.get("teacher_name") ?? "") },
    { key: "teacher_qualification", value: String(formData.get("teacher_qualification") ?? "") },
    { key: "teacher_description", value: String(formData.get("teacher_description") ?? "") },
    { key: "subject_name", value: String(formData.get("subject_name") ?? "") },
    { key: "subject_code", value: String(formData.get("subject_code") ?? "") },
    { key: "subject_description", value: String(formData.get("subject_description") ?? "") },
  ];

  const promises = updates.map(({ key, value }) =>
    supabase
      .from("site_settings")
      .upsert({ key, value, updated_at: new Date().toISOString() })
  );

  await Promise.all(promises);
  revalidatePath("/admin/site-content");
}
