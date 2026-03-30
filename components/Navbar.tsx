"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/login/actions";

interface NavbarProps {
  siteName: string;
  user: any;
  profile: any;
}

export default function Navbar({ siteName, user, profile }: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close mobile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: "/about", label: "About" },
    { href: "/results", label: "Results" },
    { href: "/schedule", label: "Schedule" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-indigo-100 bg-white/85 backdrop-blur-xl">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <Link href="/" className="text-base font-bold tracking-tight text-indigo-700 md:text-lg">
            {siteName}
          </Link>
          <span className="rounded-full bg-indigo-100 px-2 mt-0.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-indigo-700">
            Beta
          </span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-2 text-sm md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-2 ${
                pathname === link.href
                  ? "bg-indigo-50 text-indigo-700 font-medium"
                  : "text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {user && profile ? (
            <div className="relative ml-2" ref={profileMenuRef}>
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
                  {profile.full_name?.charAt(0) || user.email?.charAt(0) || (profile.role === 'admin' ? "A" : "S")}
                </div>
                <span className="max-w-[120px] truncate">
                  {profile.full_name || (profile.role === 'admin' ? "Admin" : "Student")}
                </span>
                <svg className={`h-4 w-4 text-slate-400 transition-transform ${profileMenuOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl border border-indigo-100 bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="border-b border-slate-100 px-4 py-2">
                    <p className="text-xs text-slate-500">Signed in as</p>
                    <p className="truncate text-sm font-medium text-slate-900">{user.email}</p>
                    {profile.role === 'admin' && (
                      <span className="mt-1 inline-block rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold uppercase text-indigo-700">
                        Admin
                      </span>
                    )}
                  </div>
                  <Link href="/dashboard" className="block px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50">
                    Dashboard
                  </Link>
                  <Link href="/dashboard/profile" className="block px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50">
                    Profile
                  </Link>
                  {profile.role === 'admin' && (
                    <Link href="/admin" className="block px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50">
                      Admin Panel
                    </Link>
                  )}
                  <form action={logout} className="border-t border-slate-100">
                    <button type="submit" className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50">
                      Sign out
                    </button>
                  </form>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="ml-1 rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white shadow-sm hover:bg-indigo-700"
            >
              Student Login
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden" ref={mobileMenuRef}>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center justify-center rounded-lg border border-indigo-100 bg-white p-2 text-indigo-700 hover:bg-indigo-50 focus:outline-none"
            aria-expanded={mobileMenuOpen}
          >
            <span className="sr-only">Open main menu</span>
            {!mobileMenuOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </button>

          {/* Mobile dropdown */}
          {mobileMenuOpen && (
            <div className="absolute right-4 top-16 mt-2 w-56 origin-top-right rounded-xl border border-indigo-100 bg-white p-2 shadow-xl ring-1 ring-black ring-opacity-5">
              {user && profile && (
                <div className="mb-2 border-b border-slate-100 px-3 pb-2">
                  <p className="text-sm font-medium text-slate-900">
                    {profile.full_name || (profile.role === 'admin' ? "Admin" : "Student")}
                  </p>
                  <p className="truncate text-xs text-slate-500">{user.email}</p>
                  {profile.role === 'admin' && (
                    <span className="mt-1 inline-block rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold uppercase text-indigo-700">
                      Admin
                    </span>
                  )}
                </div>
              )}


              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block rounded-lg px-3 py-2 text-sm ${
                    pathname === link.href
                      ? "bg-indigo-50 text-indigo-700 font-medium"
                      : "text-slate-700 hover:bg-indigo-50"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              <div className="mt-2 border-t border-slate-100 pt-2">
                {user && profile ? (
                  <>
                    <Link href="/dashboard" className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-indigo-50">
                      Dashboard
                    </Link>
                    <Link href="/dashboard/profile" className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-indigo-50">
                      Profile
                    </Link>
                    {profile.role === 'admin' && (
                      <Link href="/admin" className="block rounded-lg px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50">
                        Admin Panel
                      </Link>
                    )}
                    <form action={logout}>

                      <button type="submit" className="block w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 mt-1">
                        Sign out
                      </button>
                    </form>
                  </>
                ) : (
                  <Link href="/login" className="mt-1 block rounded-lg bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white">
                    Student Login
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
