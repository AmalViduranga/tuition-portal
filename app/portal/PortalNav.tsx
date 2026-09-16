"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, BookOpen, Video, FileText } from "lucide-react";

export default function PortalNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/portal/classes", label: "My Classes", icon: BookOpen },
    { href: "/portal/recordings", label: "Recordings", icon: Video },
    { href: "/portal/materials", label: "Materials", icon: FileText },
  ];

  return (
    <div className="mb-6 overflow-x-auto pb-1">
      <nav className="inline-flex space-x-1.5 rounded-2xl bg-slate-100/90 dark:bg-slate-900/90 p-1.5 border border-slate-200/80 dark:border-slate-800">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname === "/portal" && item.href === "/dashboard");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-150 ${
                isActive
                  ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs border border-slate-200/80 dark:border-slate-700"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/50"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
