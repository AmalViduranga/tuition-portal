"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { logout } from "@/app/login/actions";
import { ActionSubmitButton, ThemeToggle } from "@/components/ui";
import ExamCountdown from "@/components/home/ExamCountdown";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Video,
  FileText,
  CreditCard,
  TrendingUp,
  Megaphone,
  Globe,
  ShieldCheck,
  Home,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/students", label: "Students", icon: Users },
  { href: "/admin/classes", label: "Classes", icon: BookOpen },
  { href: "/admin/recordings", label: "Recordings", icon: Video },
  { href: "/admin/materials", label: "Materials", icon: FileText },
  { href: "/admin/enrollments", label: "Enrollments & Payments", icon: CreditCard },
  { href: "/admin/earnings", label: "Earnings", icon: TrendingUp },
  { href: "/admin/promotions", label: "Promotions", icon: Megaphone },
  { href: "/admin/site-content", label: "Site Content", icon: Globe },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: ShieldCheck },
];

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (!sidebarOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSidebarOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090D16] text-slate-900 dark:text-slate-100 relative flex transition-colors duration-200">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 lg:hidden animate-in fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 transform bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 shadow-sm lg:shadow-none transition-all duration-300 ease-in-out w-64 ${
          isCollapsed ? "lg:w-20" : "lg:w-64"
        } ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        aria-label="Sidebar"
      >
        <div className="flex h-full flex-col">
          {/* Logo / Header */}
          <div
            className={`flex h-16 items-center border-b border-slate-200/80 dark:border-slate-800 px-4 ${
              isCollapsed ? "justify-center" : "justify-between"
            }`}
          >
            <div className={`flex items-center gap-2.5 ${isCollapsed ? "lg:hidden" : ""}`}>
              <Link href="/admin" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
                <Image
                  src="/AV_Logo_01-removebg-preview.png"
                  alt="AV Classes Logo"
                  width={36}
                  height={36}
                  priority
                  className="h-8 w-8 object-contain shrink-0"
                />
                <span className="text-base font-bold text-blue-600 dark:text-blue-400 tracking-tight whitespace-nowrap">
                  Admin Portal
                </span>
              </Link>
            </div>
            {isCollapsed && (
              <div className="hidden lg:flex items-center justify-center">
                <Image
                  src="/AV_Logo_01-removebg-preview.png"
                  alt="AV Classes Logo"
                  width={32}
                  height={32}
                  priority
                  className="h-7 w-7 object-contain"
                />
              </div>
            )}
            <button
              type="button"
              className="lg:hidden p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  title={isCollapsed ? item.label : undefined}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all duration-150 ${
                    isCollapsed ? "lg:justify-center" : ""
                  } ${
                    isActive
                      ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Icon className="h-4.5 w-4.5 shrink-0" />
                  <span
                    className={`whitespace-nowrap transition-opacity duration-200 ${
                      isCollapsed ? "lg:hidden lg:opacity-0" : "opacity-100"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Footer & Sidebar Collapse Toggle */}
          <div className="border-t border-slate-200/80 dark:border-slate-800 p-3 space-y-1.5">
            <Link
              href="/"
              title={isCollapsed ? "Back to Public Site" : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors ${
                isCollapsed ? "lg:justify-center" : ""
              }`}
            >
              <Home className="h-4.5 w-4.5 shrink-0" />
              <span className={`whitespace-nowrap ${isCollapsed ? "lg:hidden" : ""}`}>Public Site</span>
            </Link>

            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <>
                  <ChevronLeft className="h-4 w-4" />
                  <span>Collapse</span>
                </>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Main content wrapper */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isCollapsed ? "lg:ml-20" : "lg:ml-64"
        }`}
      >
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex flex-col justify-center gap-0.5">
              <h1 className="text-base font-bold text-slate-900 dark:text-white truncate">
                {navItems.find((item) => item.href === pathname)?.label || "Admin Panel"}
              </h1>
              <ExamCountdown variant="compact" />
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Theme Toggle */}
            <ThemeToggle size="sm" />

            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <span>View Site</span>
              <ExternalLink className="h-3 w-3 text-slate-400" />
            </Link>

            <Link
              href="/dashboard"
              className="inline-flex items-center rounded-lg bg-blue-600 hover:bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors"
            >
              <span className="hidden sm:inline">Student Dashboard</span>
              <span className="sm:hidden">Portal</span>
            </Link>

            <form action={logout}>
              <ActionSubmitButton
                className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                title="Log out"
              >
                Log out
              </ActionSubmitButton>
            </form>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          <div className="mx-auto max-w-[1600px] w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
