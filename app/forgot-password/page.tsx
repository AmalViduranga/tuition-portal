"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { ThemeToggle } from "@/components/ui";
import { forgotPassword } from "./actions";

const FORGOT_PASSWORD_ERRORS: Record<string, string> = {
  email_required: "Please enter your registered email address.",
  request_failed: "We couldn't send a reset link right now. Please try again.",
};

function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  const success = searchParams.get("success") === "true";
  const emailFromQuery = searchParams.get("email") || "";
  const rawError = searchParams.get("error");
  const errorFromQuery = rawError
    ? FORGOT_PASSWORD_ERRORS[rawError] ?? "We couldn't send a reset link right now. Please try again."
    : null;

  const [email, setEmail] = useState(emailFromQuery);
  const [error, setError] = useState<string | null>(errorFromQuery);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("email", email);

      // This will redirect, so we won't get a response
      await forgotPassword(formData);
    } catch (err) {
      // Allow Next.js redirect errors to propagate naturally
      if (err && typeof err === "object" && "digest" in err && String((err as { digest?: unknown }).digest).startsWith("NEXT_REDIRECT")) {
        throw err;
      }
      setError("We couldn't send a reset link right now. Please try again.");
      setLoading(false);
    }
  };

  // If success query param is set, show success message
  if (success && emailFromQuery) {
    return (
      <div className="w-full max-w-md rounded-lg bg-card p-8 border border-border">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
            <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Check Your Email</h1>
          <p className="mt-3 text-xs sm:text-sm text-muted-foreground">
            If an account matches <strong className="text-foreground">{emailFromQuery}</strong>, we&apos;ve sent a password reset link.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Click the link in the email to reset your password. The link will expire in 1 hour.
          </p>
          <div className="mt-6">
            <Link
              href="/login"
              className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-lg bg-card p-8 border border-border">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-link border border-border">
          <Mail className="w-6 h-6" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Reset Password</h1>
        <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
          Enter your registered email address and we&apos;ll send you a link to reset your account password.
        </p>
      </div>

      {error && (
        <div role="alert" className="mt-5 rounded-lg border border-red-200/80 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 px-3.5 py-2.5 text-xs font-medium text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:bg-card focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-colors"
            placeholder="your.email@example.com"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !email}
          className="w-full min-h-11 flex justify-center items-center gap-2 rounded-lg bg-primary hover:bg-primary-hover px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Sending link...</span>
            </>
          ) : (
            "Send Reset Link"
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
        Remembered your password?{" "}
        <Link href="/login" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
          Back to Login
        </Link>
      </p>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center bg-slate-50 dark:bg-slate-950 px-4 py-12 transition-colors">
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between max-w-5xl mx-auto w-full px-2 sm:px-4">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>
        <ThemeToggle />
      </div>

      <Suspense fallback={<div className="text-center p-8 text-slate-500 text-sm">Loading...</div>}>
        <ForgotPasswordForm />
      </Suspense>
    </div>
  );
}

