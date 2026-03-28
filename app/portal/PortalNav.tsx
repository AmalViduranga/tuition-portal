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
    <div className="mb-6 overflow-x-auto">
      <nav className="flex space-x-2 rounded-xl bg-slate-100/80 p-1.5 ring-1 ring-slate-200">
        {navItems.map((item) => {
          // Adjust active state logic to account for /dashboard or /portal
          const isActive = pathname === item.href || (pathname === "/portal" && item.href === "/dashboard");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200/50"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-indigo-600" : "text-slate-500"}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
