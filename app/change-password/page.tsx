import { updatePassword } from "@/app/login/actions";
import { SubmitButton } from "@/components/SubmitButton";
import { ThemeToggle } from "@/components/ui";
import { LockKeyhole } from "lucide-react";

type Props = {
  searchParams: Promise<{ error?: string; required?: string }>;
};

const CHANGE_PASSWORD_ERRORS: Record<string, string> = {
  password_too_short: "Password must be at least 8 characters.",
  password_mismatch: "Passwords do not match.",
  update_failed: "Could not update your password. Please try again.",
};

export default async function ChangePasswordPage({ searchParams }: Props) {
  const params = await searchParams;
  const isRequired = params.required === "true";
  const errorMessage = typeof params.error === "string"
    ? CHANGE_PASSWORD_ERRORS[params.error] ?? "Could not update your password. Please try again."
    : null;

  return (
    <main className="relative min-h-screen flex flex-col justify-center items-center bg-background px-4 py-12 transition-colors">
      <div className="absolute top-4 right-4 max-w-5xl mx-auto px-2 sm:px-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <div className="rounded-lg bg-card p-8 border border-border">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-link border border-border">
              <LockKeyhole className="w-6 h-6" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {isRequired ? "Set Your Password" : "Change Password"}
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
              {isRequired
                ? "For security, please set a personal password before continuing to your student dashboard."
                : "Enter your new password below."}
            </p>
          </div>

          {errorMessage ? (
            <div role="alert" className="mt-5 rounded-lg border border-red-200/80 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 px-3.5 py-2.5 text-xs font-medium text-red-700 dark:text-red-400">
              {errorMessage}
            </div>
          ) : null}

          <form action={updatePassword} className="mt-6 space-y-4">
            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                New Password *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                minLength={8}
                required
                autoComplete="new-password"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                placeholder="At least 8 characters"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Confirm New Password *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                minLength={8}
                required
                autoComplete="new-password"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                placeholder="Re-enter your new password"
              />
            </div>
            <div className="pt-2">
              <SubmitButton 
                label={isRequired ? "Continue to Dashboard" : "Update Password"} 
                loadingLabel={isRequired ? "Saving..." : "Updating..."} 
              />
            </div>
          </form>

          {isRequired && (
            <p className="mt-5 text-center text-xs text-slate-500 dark:text-slate-400">
              For account security, you must change your initial temporary password.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

