"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logout } from "@/app/login/actions";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "🏠" },
  { href: "/admin/students", label: "Students", icon: "👥" },
  { href: "/admin/classes", label: "Classes", icon: "📚" },
  { href: "/admin/recordings", label: "Recordings", icon: "🎥" },
  { href: "/admin/materials", label: "Materials", icon: "📄" },
  { href: "/admin/enrollments", label: "Enrollments & Payments", icon: "💳" },
  { href: "/admin/earnings", label: "Earnings", icon: "💰" },
  { href: "/admin/site-content", label: "Site Content", icon: "🌐" },
];

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 relative flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 transform bg-white shadow-xl transition-all duration-300 ease-in-out w-64 ${
          isCollapsed ? "lg:w-20" : "lg:w-64"
        } ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        aria-label="Sidebar"
      >
        <div className="flex h-full flex-col">
          {/* Logo / Header */}
          <div className={`flex h-16 items-center border-b border-slate-200 px-4 ${isCollapsed ? "justify-center" : "justify-between"}`}>
            <div className={`flex items-center gap-2 ${isCollapsed ? "lg:hidden" : ""}`}>
              <Link href="/admin" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
                <Image
                  src="/AV_Logo_01.jpg"
                  alt="AV Classes Logo"
                  width={36}
                  height={36}
                  className="h-8 w-8 object-contain rounded-md shrink-0"
                />
                <span className="text-lg font-bold text-indigo-700 whitespace-nowrap overflow-hidden block">
                  Admin Panel
                </span>
              </Link>
              <span className="rounded-full bg-indigo-100 px-2 mt-0.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-indigo-700">
                Beta
              </span>
            </div>
            {isCollapsed && (
              <div className="hidden lg:flex items-center justify-center">
                <Image
                  src="/AV_Logo_01.jpg"
                  alt="AV Classes Logo"
                  width={36}
                  height={36}
                  className="h-8 w-8 object-contain rounded-md"
                />
              </div>
            )}
            <button
              type="button"
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-md"
              onClick={() => setSidebarOpen(false)}
            >
              ✕
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-hidden hover:overflow-y-auto px-3 py-4 overflow-x-hidden">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  title={isCollapsed ? item.label : undefined}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isCollapsed ? "lg:justify-center" : ""
                  } ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span className="text-xl flex-shrink-0">{item.icon}</span>
                  <span className={`whitespace-nowrap transition-opacity duration-200 ${isCollapsed ? "lg:hidden lg:opacity-0" : "opacity-100"}`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Footer & Toggle */}
          <div className="border-t border-slate-200 p-4 space-y-2">
            <Link
              href="/"
              title={isCollapsed ? "Back to Site" : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 ${
                isCollapsed ? "lg:justify-center" : ""
              }`}
            >
              <span className="text-xl flex-shrink-0">🏠</span>
              <span className={`whitespace-nowrap ${isCollapsed ? "lg:hidden" : ""}`}>Back to Site</span>
            </Link>
            
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex w-full items-center justify-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-100 transition-colors"
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <span className="text-xl flex-shrink-0">
                {isCollapsed ? "➡️" : "⬅️"}
              </span>
              <span className={`whitespace-nowrap ${isCollapsed ? "lg:hidden" : ""}`}>Collapse</span>
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
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
          <button
            type="button"
            className="rounded-lg p-2 -ml-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex-1 ml-4 lg:ml-0 overflow-hidden">
            <h1 className="text-lg font-semibold text-slate-900 truncate">
              {navItems.find((item) => item.href === pathname)?.label || "Admin"}
            </h1>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 ml-4 shrink-0">
            <Link
              href="/"
              className="text-sm font-medium text-slate-600 hover:text-indigo-600 hidden sm:block"
            >
              View Site
            </Link>
            <Link
              href="/dashboard"
              className="rounded-lg bg-indigo-600 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              <span className="hidden sm:inline">Student Dashboard</span>
              <span className="sm:hidden">Dashboard</span>
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-lg bg-slate-100 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
                title="Log out"
              >
                Log out
              </button>
            </form>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">
          <div className="mx-auto max-w-7xl w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
