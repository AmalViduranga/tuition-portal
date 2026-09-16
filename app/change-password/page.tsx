import { updatePassword } from "@/app/login/actions";
import { SubmitButton } from "@/components/SubmitButton";
import { ThemeToggle } from "@/components/ui";
import { LockKeyhole } from "lucide-react";

type Props = {
  searchParams: Promise<{ error?: string; required?: string }>;
};

export default async function ChangePasswordPage({ searchParams }: Props) {
  const params = await searchParams;
  const isRequired = params.required === "true";

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center bg-slate-50 dark:bg-slate-950 px-4 py-12 transition-colors">
      <div className="absolute top-4 right-4 max-w-5xl mx-auto px-2 sm:px-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200/80 dark:border-slate-800 transition-all">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60">
              <LockKeyhole className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {isRequired ? "Set Your Password" : "Change Password"}
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {isRequired
                ? "For security, please set a personal password before continuing to your student dashboard."
                : "Enter your new password below."}
            </p>
          </div>

          {params.error ? (
            <div className="mt-5 rounded-xl border border-red-200/80 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 px-3.5 py-2.5 text-xs font-medium text-red-700 dark:text-red-400">
              {params.error}
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
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
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
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
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
    </div>
  );
}

