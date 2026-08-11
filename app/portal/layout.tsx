import Link from "next/link";
import Image from "next/image";
import { requireUser } from "@/lib/auth";
import { logout } from "@/app/login/actions";
import PortalNav from "./PortalNav";
import StudentNotifications from "@/components/portal/StudentNotifications";
import { ActionSubmitButton } from "@/components/ui";
import ExamCountdown from "@/components/home/ExamCountdown";

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
            <button type="submit" className="text-blue-600 font-medium hover:underline">Logout</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white shadow-sm backdrop-blur transition-all">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 md:gap-3">
            <Link href="/dashboard" className="flex items-center hover:opacity-90 transition-opacity shrink-0">
              <Image
                src="/AV_Logo_01-removebg-preview.png"
                alt="AV Classes Logo"
                width={42}
                height={42}
                priority
                className="h-8 w-8 md:h-10 md:w-10 object-contain shrink-0"
              />
            </Link>
            <div className="flex flex-col justify-center gap-0.5">
              <Link href="/dashboard" className="text-xl font-bold tracking-tight text-blue-700 hover:opacity-90 transition-opacity leading-none">
                <span className="hidden sm:inline-block">Student Dashboard</span>
                <span className="sm:hidden">Dashboard</span>
              </Link>
              <ExamCountdown variant="compact" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            {profile?.role === "admin" && (
              <Link
                href="/admin"
                className="hidden sm:inline-flex items-center rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors"
              >
                Admin Panel
              </Link>
            )}
            <StudentNotifications />
            <Link
              href="/dashboard/profile"
              className="inline-flex items-center rounded-lg bg-white border border-slate-200 shadow-sm px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              Profile
            </Link>
            <form action={logout}>
              <ActionSubmitButton
                className="inline-flex items-center rounded-lg bg-slate-900 shadow-sm border border-transparent px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
              >
                Sign out
              </ActionSubmitButton>
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
