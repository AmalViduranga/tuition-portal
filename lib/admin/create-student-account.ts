import { randomBytes } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export type CreateStudentAccountResult =
  | { ok: true; studentId: string; temporaryPassword?: string }
  | { ok: false; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function generateTemporaryPassword(): string {
  return randomBytes(18).toString("base64url");
}

/**
 * Creates a Supabase Auth user, profile (role student), and optional enrollments.
 * Uses the service-role client only on the server — never import this module from client components.
 * Callers must verify the current user is an admin (e.g. `await requireAdmin()`) before invoking.
 */
export async function createStudentAccount(input: {
  email: string;
  /** If empty, a strong temporary password is generated and returned once in the result. */
  password: string;
  fullName: string;
  phone: string;
  classIds: string[];
  startAccessDate: string;
  mustChangePassword: boolean;
}): Promise<CreateStudentAccountResult> {
  const email = normalizeEmail(input.email);
  const fullName = input.fullName.trim();
  const phone = input.phone.trim();
  const passwordIn = input.password.trim();
  const classIds = input.classIds.map((id) => String(id).trim()).filter(Boolean);
  const startAccessDate = input.startAccessDate.trim();

  if (!fullName || fullName.length < 2) {
    return { ok: false, error: "Please enter the student’s full name (at least 2 characters)." };
  }

  if (!email || !EMAIL_RE.test(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }

  let password = passwordIn;
  let generatedPassword: string | undefined;

  if (!password) {
    generatedPassword = generateTemporaryPassword();
    password = generatedPassword;
  } else if (password.length < 6) {
    return { ok: false, error: "Password must be at least 6 characters, or leave blank to auto-generate one." };
  }

  if (classIds.length > 0 && !startAccessDate) {
    return {
      ok: false,
      error: "Start access date is required when assigning one or more classes.",
    };
  }

  const adminClient = createAdminClient();

  const { data: existingProfile } = await adminClient
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existingProfile) {
    return { ok: false, error: "A student with this email already exists." };
  }

  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      ...(phone ? { phone } : {}),
    },
  });

  if (authError || !authData?.user) {
    const msg = authError?.message ?? "Could not create auth user.";
    const lower = msg.toLowerCase();
    if (
      lower.includes("already been registered") ||
      lower.includes("already registered") ||
      lower.includes("user already exists") ||
      authError?.status === 422
    ) {
      return { ok: false, error: "This email is already registered in Supabase Auth." };
    }
    return { ok: false, error: msg };
  }

  const userId = authData.user.id;

  const { error: profileError } = await adminClient.from("profiles").upsert(
    {
      id: userId,
      full_name: fullName,
      email,
      phone: phone || null,
      role: "student",
      is_active: true,
      must_change_password: input.mustChangePassword,
    },
    { onConflict: "id" },
  );

  if (profileError) {
    await adminClient.auth.admin.deleteUser(userId);
    return {
      ok: false,
      error: `Could not save profile: ${profileError.message}. The auth user was rolled back.`,
    };
  }

  if (classIds.length > 0) {
    const rows = classIds.map((classId) => {
      const startDate = new Date(startAccessDate);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 45);

      return {
        student_id: userId,
        class_id: classId,
        start_access_date: startAccessDate,
        access_end_date: endDate.toISOString().split("T")[0],
        access_mode: "paid", // Default to paid for new account creation
      };
    });

    // Use insert instead of upsert to potentially keep history if PK allows
    // But since we are creating a new user, conflict is unlikely on student_id.
    const { error: enrollError } = await adminClient.from("student_class_enrollments").insert(rows);

    if (enrollError) {
      await adminClient.auth.admin.deleteUser(userId);
      return {
        ok: false,
        error: `Could not create enrollment: ${enrollError.message}. The new account was rolled back.`,
      };
    }
  }

  return {
    ok: true,
    studentId: userId,
    ...(generatedPassword ? { temporaryPassword: generatedPassword } : {}),
  };
}

export function parseCreateStudentFormData(formData: FormData) {
  const classIds = formData
    .getAll("class_ids")
    .map((id) => String(id).trim())
    .filter(Boolean);

  return {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    fullName: String(formData.get("full_name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    classIds,
    startAccessDate: String(formData.get("start_access_date") ?? ""),
    mustChangePassword: formData.get("must_change_password") === "on",
  };
}
