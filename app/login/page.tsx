import Link from "next/link";
import { LoginForm } from "./login-form";

type Props = {
  searchParams: Promise<{ error?: string; next?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const nextPath = params?.next ?? "/dashboard";

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="mx-auto w-full max-w-md rounded-xl bg-white p-6 shadow-sm border border-slate-100">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-slate-900">Student Portal Login</h1>
          <p className="mt-2 text-sm text-slate-600">
            Sign in to access your classes, study materials, and recordings. Accounts are securely created by your instructor.
          </p>
        </div>

        {params.error ? (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {params.error}
          </div>
        ) : null}

        <LoginForm nextPath={nextPath} />

        <div className="mt-4 text-center">
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            Forgot password?
          </Link>
        </div>

        <div className="mt-6 border-t border-slate-200 pt-4 text-center">
          <p className="text-xs text-slate-500">
            Don't have an account?{" "}
            <Link href="/contact" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Contact us
            </Link>{" "}
            to request access.
          </p>
        </div>
      </div>
    </div>
  );
}
