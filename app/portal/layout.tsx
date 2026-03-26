import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { logout } from "@/app/login/actions";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { supabase, user } = await requireUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  return (
    <div className="space-y-6">
      <header className="rounded-xl bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">Student Portal</h1>
            <p className="text-sm text-slate-600">{profile?.full_name ?? "Student"}</p>
          </div>
          <div className="flex items-center gap-2">
            {profile?.role === "admin" ? (
              <Link href="/admin" className="rounded-md border border-slate-300 px-3 py-2 text-sm">
                Admin Panel
              </Link>
            ) : null}
            <form action={logout}>
              <button type="submit">Logout</button>
            </form>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
