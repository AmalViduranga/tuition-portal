import Link from "next/link";
import Image from "next/image";
import { LoginForm } from "./login-form";
import { safeNextPath } from "@/lib/utils/safe-redirect";

type Props = {
  searchParams: Promise<{ error?: string; next?: string; reason?: string }>;
};

// Only these messages can appear in the error box; arbitrary ?error= text is never echoed.
const LOGIN_ERRORS: Record<string, string> = {
  invalid_credentials: "Incorrect email or password.",
  rate_limited: "Too many attempts. Please wait a few minutes and try again.",
  session_unavailable: "We couldn't load your account just now. Please try again.",
  account_not_set_up: "This account isn't set up yet. Please contact your teacher.",
  // Messages issued by lib/auth.ts
  "Your account was logged in from another device": "Your account was logged in from another device.",
  "Session invalidated. Please log in again.": "Your session ended. Please log in again.",
};

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const nextPath = safeNextPath(params?.next, "/dashboard");
  const errorMessage = typeof params.error === "string"
    ? LOGIN_ERRORS[params.error] ?? "Sign-in failed. Please try again."
    : null;

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-lg border border-border bg-card p-6 sm:p-7">
        <div className="text-center">
          <div className="mb-3.5 flex justify-center">
            <div className="rounded-lg border border-border bg-muted p-2">
              <Image
                src="/AV_Logo_01-removebg-preview.png"
                alt="AV Classes Logo"
                width={48}
                height={48}
                className="h-11 w-11 object-contain"
              />
            </div>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Student Portal Login
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Sign in to access your classes, study materials, and recordings.
          </p>
        </div>

        {errorMessage ? (
          <div role="alert" className="mt-4 rounded-lg border border-red-200/80 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 px-3.5 py-2.5 text-xs font-medium text-red-700 dark:text-red-400">
            {errorMessage}
          </div>
        ) : null}

        {params.reason === "session_expired" ? (
          <div className="mt-4 rounded-lg border border-amber-200/80 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/40 px-3.5 py-2.5 text-xs font-medium text-amber-800 dark:text-amber-400">
            Your eight-hour session has expired. Please sign in again.
          </div>
        ) : null}

        <LoginForm nextPath={nextPath} />

        <div className="mt-4 text-center">
          <Link
            href="/forgot-password"
            className="inline-flex min-h-10 items-center text-sm font-semibold text-link underline decoration-link/60 underline-offset-4 transition-colors hover:decoration-link"
          >
            Forgot your password?
          </Link>
        </div>

        <div className="mt-4 border-t border-border pt-4 text-center">
          <p className="text-xs text-muted-foreground">
            Accounts are created by your instructor. Need access?{" "}
            <Link
              href="/contact"
              className="font-semibold text-link underline decoration-link/60 underline-offset-4 hover:decoration-link"
            >
              Contact us
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

