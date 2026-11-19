import Link from "next/link";
import Image from "next/image";
import { requireUser } from "@/lib/auth";
import { logout } from "@/app/login/actions";
import StudentNotifications from "@/components/portal/StudentNotifications";
import { ActionSubmitButton, ThemeToggle } from "@/components/ui";
import PortalNav from "@/app/portal/PortalNav";
import ExamCountdown from "@/components/home/ExamCountdown";

export default async function DashboardLayout({
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
      <div className="flex min-h-screen items-center justify-center p-4 text-center bg-background">
        <div className="rounded-lg border border-border bg-card p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-rose-600 dark:text-rose-400">Account Inactive</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your account has been deactivated. Please contact support.
          </p>
          <form action={logout} className="mt-6">
            <button
              type="submit"
              className="w-full min-h-11 rounded-lg bg-slate-900 dark:bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans transition-colors">
      <header className="sticky top-0 z-30 border-b border-border bg-card transition-colors">
        <div className="container-fluid flex h-16 items-center justify-between">
          <div className="flex items-center gap-2.5 md:gap-3.5">
            <Link href="/dashboard" className="flex items-center hover:opacity-90 transition-opacity shrink-0">
              <Image
                src="/AV_Logo_01-removebg-preview.png"
                alt="AV Classes Logo"
                width={36}
                height={36}
                priority
                className="h-8 w-8 md:h-9 md:w-9 object-contain shrink-0"
              />
            </Link>
            <div className="flex flex-col justify-center gap-0.5">
              <Link href="/dashboard" className="text-base md:text-lg font-bold tracking-tight text-link hover:opacity-90 transition-opacity leading-none">
                <span className="hidden sm:inline-block">Student Dashboard</span>
                <span className="sm:hidden">Dashboard</span>
              </Link>
              <ExamCountdown variant="compact" />
            </div>
          </div>
          <div className="flex items-center gap-2.5 sm:gap-3">
            {profile?.role === "admin" && (
              <Link
                href="/admin"
                className="hidden sm:inline-flex items-center rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
              >
                Admin Panel
              </Link>
            )}
            <ThemeToggle size="sm" />
            <StudentNotifications />
            <Link
              href="/dashboard/profile"
              className="inline-flex items-center rounded-lg bg-card border border-border px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              Profile
            </Link>
            <form action={logout}>
              <ActionSubmitButton
                className="inline-flex items-center rounded-lg bg-slate-900 dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
              >
                Sign out
              </ActionSubmitButton>
            </form>
          </div>
        </div>
      </header>

      <main className="container-fluid py-8">
        <div className="mb-8">
          <PortalNav />
        </div>
        {children}
      </main>
    </div>
  );
}
