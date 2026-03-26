import Link from "next/link";
import { login } from "./actions";
import { LoginSubmitButton } from "./login-submit-button";

type Props = {
  searchParams: Promise<{ error?: string; next?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  return (
    <section className="mx-auto w-full max-w-md rounded-xl bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold">Student Login</h1>
      <p className="mt-2 text-sm text-slate-600">
        Admin and students both sign in here. Accounts are created by admin only.
      </p>
      {params.error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {params.error}
        </p>
      ) : null}
      <form action={login} className="mt-4 space-y-3">
        <input type="hidden" name="next" value={params.next ?? "/dashboard"} />
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            Email
          </label>
          <input id="email" name="email" type="email" required />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">
            Password
          </label>
          <input id="password" name="password" type="password" required />
        </div>
        <LoginSubmitButton />
      </form>
      <p className="mt-4 text-sm">
        <Link href="/contact" className="text-blue-600">
          Need an account? Contact us.
        </Link>
      </p>
    </section>
  );
}
