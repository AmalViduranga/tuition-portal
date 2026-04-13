import Link from "next/link";
import Image from "next/image";
import { requireUser } from "@/lib/auth";
import { logout } from "@/app/login/actions";
import PortalNav from "./PortalNav";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { supabase, user } = await requireUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, is_active")
    .eq("id", user.id)
    .single();

  if (!profile?.is_active) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        <div>
          <h1 className="text-2xl font-bold text-red-600">Account Inactive</h1>
          <p className="mt-2 text-slate-600">Your account has been deactivated. Please contact support.</p>
          <form action={logout} className="mt-4">
            <button type="submit" className="text-indigo-600 font-medium hover:underline">Logout</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white shadow-sm backdrop-blur transition-all">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2 text-xl font-bold tracking-tight text-indigo-700 hover:opacity-90 transition-opacity">
              <Image
                src="/AV_Logo_01.jpg"
                alt="AV Classes Logo"
                width={40}
                height={40}
                className="h-8 w-8 md:h-10 md:w-10 object-contain rounded-md shrink-0"
              />
              <span className="hidden sm:inline-block">Student Dashboard</span>
              <span className="sm:hidden">Dashboard</span>
            </Link>
            <span className="hidden sm:inline-block rounded-full bg-indigo-100 px-2 mt-0.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-indigo-700">
              Beta
            </span>
          </div>
          <div className="flex items-center gap-4">
            {profile?.role === "admin" && (
              <Link
                href="/admin"
                className="hidden sm:inline-flex items-center rounded-lg bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-100 transition-colors"
              >
                Admin Panel
              </Link>
            )}
            <form action={logout}>
              <button
                type="submit"
                className="inline-flex items-center rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 transition-colors"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <PortalNav />
        </div>
        {children}
      </main>
    </div>
  );
}
