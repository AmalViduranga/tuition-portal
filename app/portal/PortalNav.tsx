"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { logout } from "@/app/login/actions";

export default function PortalNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/portal", label: "Dashboard", icon: "🏠" },
    { href: "/portal/classes", label: "My Classes", icon: "📚" },
    { href: "/portal/recordings", label: "Recordings", icon: "🎥" },
    { href: "/portal/materials", label: "Materials", icon: "📄" },
  ];

  return (
    <div className="mb-6 overflow-x-auto">
      <nav className="flex space-x-1 rounded-lg bg-slate-100 p-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
