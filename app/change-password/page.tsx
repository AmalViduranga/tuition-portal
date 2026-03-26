import { updatePassword } from "@/app/login/actions";

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function ChangePasswordPage({ searchParams }: Props) {
  const params = await searchParams;

  return (
    <section className="mx-auto w-full max-w-md rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">Change Password</h1>
      <p className="mt-2 text-sm text-slate-600">
        For security, please set a new password before continuing to your dashboard.
      </p>

      {params.error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{params.error}</p>
      ) : null}

      <form action={updatePassword} className="mt-4 space-y-3">
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">
            New Password
          </label>
          <input id="password" name="password" type="password" minLength={8} required />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium">
            Confirm Password
          </label>
          <input id="confirmPassword" name="confirmPassword" type="password" minLength={8} required />
        </div>
        <button type="submit" className="w-full">
          Update Password
        </button>
      </form>
    </section>
  );
}
