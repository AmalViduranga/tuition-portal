"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function resetPassword(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const token = String(formData.get("token") ?? "");

  if (!password) {
    redirect("/reset-password?error=Password%20is%20required");
  }

  if (password.length < 8) {
    redirect("/reset-password?error=Password%20must%20be%20at%20least%208%20characters");
  }

  if (!token) {
    redirect("/reset-password?error=Missing%20reset%20token");
  }

  const supabase = await createClient();

  // Verify the token and update password
  const { error } = await supabase.auth.verifyOtp({
    token_hash: token,
    type: "recovery",
  });

  if (error) {
    redirect(`/reset-password?error=${encodeURIComponent(error.message)}`);
  }

  // Update the password
  const { error: updateError } = await supabase.auth.updateUser({
    password,
    // Clear must_change_password flag if set
    user_metadata: { must_change_password: false },
  });

  if (updateError) {
    redirect(`/reset-password?error=${encodeURIComponent(updateError.message)}`);
  }

  // Also clear the flag in profiles table
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await supabase
      .from("profiles")
      .update({ must_change_password: false })
      .eq("id", user.id);
  }

  redirect("/reset-password?success=true");
}
