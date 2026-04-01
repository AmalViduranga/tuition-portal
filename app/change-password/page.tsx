import { updatePassword } from "@/app/login/actions";
import Link from "next/link";
import { SubmitButton } from "@/components/SubmitButton";

type Props = {
  searchParams: Promise<{ error?: string; required?: string }>;
};

export default async function ChangePasswordPage({ searchParams }: Props) {
  const params = await searchParams;
  const isRequired = params.required === "true";

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="mx-auto w-full max-w-md rounded-xl bg-white p-6 shadow-sm">
        <div className="text-center">
          <div className="text-5xl mb-4">🔐</div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isRequired ? "Set Your Password" : "Change Password"}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {isRequired
              ? "For security, please set a new password to continue."
              : "Enter your new password below."}
          </p>
        </div>

        {params.error ? (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {params.error}
          </div>
        ) : null}

        <form action={updatePassword} className="mt-6 space-y-4">
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
              New Password *
            </label>
            <input
              id="password"
              name="password"
              type="password"
              minLength={8}
              required
              autoComplete="new-password"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="At least 8 characters"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-slate-700">
              Confirm New Password *
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              minLength={8}
              required
              autoComplete="new-password"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Re-enter your new password"
            />
          </div>
          <SubmitButton 
            label={isRequired ? "Continue to Dashboard" : "Update Password"} 
            loadingLabel={isRequired ? "Saving..." : "Updating..."} 
          />
        </form>

        {isRequired && (
          <p className="mt-4 text-center text-xs text-slate-500">
            After setting your password, you'll be redirected to your student dashboard.
          </p>
        )}

        <div className="mt-6 text-center">
          <Link href="/dashboard" className="text-sm text-indigo-600 hover:text-indigo-700">
            Skip for now (return to dashboard)
          </Link>
        </div>
      </div>
    </div>
  );
}
