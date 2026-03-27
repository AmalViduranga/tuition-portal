"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function forgotPassword(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const supabase = await createClient();

  if (!email) {
    redirect("/forgot-password?error=Email%20is%20required");
  }

  // Send password reset email via Supabase
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/reset-password`,
  });

  if (error) {
    // Don't reveal whether email exists for security
    // Just redirect to success page anyway
    console.log("Password reset error:", error.message);
  }

  // Always redirect to success page (even if email doesn't exist)
  // This prevents email enumeration attacks
  redirect(`/forgot-password?success=true&email=${encodeURIComponent(email)}`);
}
