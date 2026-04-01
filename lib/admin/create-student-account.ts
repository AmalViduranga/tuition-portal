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
 * Creates a Supabase Auth user and profile (role student).
 * Uses the service-role client only on the server.
 */
export async function createStudentAccount(input: {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  mustChangePassword: boolean;
}): Promise<CreateStudentAccountResult> {
  const email = normalizeEmail(input.email);
  const fullName = input.fullName.trim();
  const phone = input.phone.trim();
  const passwordIn = input.password.trim();

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

  const adminClient = createAdminClient();

  // Check for existing profile
  const { data: existingProfile } = await adminClient
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existingProfile) {
    return { ok: false, error: "A student with this email already exists." };
  }

  // Create Auth user
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
    return { ok: false, error: msg };
  }

  const userId = authData.user.id;

  // Create Profile
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

  return {
    ok: true,
    studentId: userId,
    ...(generatedPassword ? { temporaryPassword: generatedPassword } : {}),
  };
}

export function parseCreateStudentFormData(formData: FormData) {
  return {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    fullName: String(formData.get("full_name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    mustChangePassword: formData.get("must_change_password") === "on",
  };
}
