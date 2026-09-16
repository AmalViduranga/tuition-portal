import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/ui";
import { LoginForm } from "./login-form";
import { ArrowLeft } from "lucide-react";

type Props = {
  searchParams: Promise<{ error?: string; next?: string; reason?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const nextPath = params?.next ?? "/dashboard";

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center bg-slate-50 dark:bg-slate-950 px-4 py-12 transition-colors">
      {/* Top bar with back to home and theme toggle */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between max-w-5xl mx-auto w-full px-2 sm:px-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200/80 dark:border-slate-800 transition-all">
          <div className="text-center">
            <div className="flex justify-center mb-5">
              <div className="p-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 shadow-xs">
                <Image
                  src="/AV_Logo_01-removebg-preview.png"
                  alt="AV Classes Logo"
                  width={64}
                  height={64}
                  className="h-14 w-14 object-contain"
                />
              </div>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Student Portal Login
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Sign in to access your classes, study materials, and recordings. Accounts are securely created by your instructor.
            </p>
          </div>

          {params.error ? (
            <div className="mt-5 rounded-xl border border-red-200/80 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 px-3.5 py-2.5 text-xs font-medium text-red-700 dark:text-red-400">
              {params.error}
            </div>
          ) : null}

          {params.reason === "session_expired" ? (
            <div className="mt-5 rounded-xl border border-amber-200/80 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/40 px-3.5 py-2.5 text-xs font-medium text-amber-800 dark:text-amber-400">
              Your eight-hour session has expired. Please sign in again.
            </div>
          ) : null}

          <LoginForm nextPath={nextPath} />

          <div className="mt-5 text-center">
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              Forgot your password?
            </Link>
          </div>

          <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-5 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Don&apos;t have an account?{" "}
              <Link href="/contact" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                Contact us
              </Link>{" "}
              to request enrollment access.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

