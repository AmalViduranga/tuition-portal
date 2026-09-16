"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { logout } from "@/app/login/actions";

import { ActionSubmitButton, LoadingLink, ThemeToggle } from "@/components/ui";
import ExamCountdown from "@/components/home/ExamCountdown";

interface NavbarProps {
  siteName: string;
  user: { email?: string } | null;
  profile: { full_name?: string; role?: string } | null;
}

export default function Navbar({ siteName, user, profile }: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
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
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMobileMenuOpen(false);
    setProfileMenuOpen(false);
  }

  // Hide main navbar on internal dashboard/portal/admin routes
  const isInternalRoute = 
    pathname.startsWith("/admin") || 
    pathname.startsWith("/portal") || 
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/change-password");

  if (isInternalRoute) return null;

  const navLinks = [
    { href: "/about", label: "About" },
    { href: "/results", label: "Results" },
    { href: "/schedule", label: "Schedule" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-[#090D16]/85 backdrop-blur-2xl shadow-xs transition-colors duration-200">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5 md:gap-3.5">
          <Link href="/" className="flex items-center hover:opacity-90 transition-opacity shrink-0" aria-label="Home">
            <Image
              src="/AV_Logo_01-removebg-preview.png"
              alt="AV Classes Logo"
              width={42}
              height={42}
              priority
              className="h-8 w-8 md:h-9 md:w-9 object-contain drop-shadow-xs"
            />
          </Link>
          <div className="flex flex-col justify-center gap-0.5">
            <Link href="/" className="hidden sm:block text-base font-extrabold tracking-tight text-blue-600 dark:text-blue-400 md:text-lg hover:opacity-90 transition-opacity leading-none">
              {siteName}
            </Link>
            <ExamCountdown variant="compact" />
          </div>
        </div>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-1.5 md:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-xl px-3.5 py-2 text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold shadow-xs"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          <div className="mx-1 h-5 w-px bg-slate-200 dark:bg-slate-800" />

          {/* Theme Switcher */}
          <ThemeToggle size="sm" />

          {user && profile ? (
            <div className="relative ml-1" ref={profileMenuRef}>
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold text-xs">
                  {profile.full_name?.charAt(0) || user.email?.charAt(0) || (profile.role === 'admin' ? "A" : "S")}
                </div>
                <span className="max-w-[120px] truncate">
                  {profile.full_name || (profile.role === 'admin' ? "Admin" : "Student")}
                </span>
                <svg className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${profileMenuOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 origin-top-right rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-1.5 shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-150">
                  <div className="border-b border-slate-100 dark:border-slate-800 px-4 py-2.5">
                    <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Signed in as</p>
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{user.email}</p>
                    {profile.role === 'admin' && (
                      <span className="mt-1.5 inline-block rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400">
                        Admin
                      </span>
                    )}
                  </div>
                  <div className="p-1 space-y-0.5">
                    <Link href="/dashboard" className="block rounded-xl px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors font-medium">
                      Dashboard
                    </Link>
                    <Link href="/dashboard/profile" className="block rounded-xl px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors font-medium">
                      Profile
                    </Link>
                    {profile.role === 'admin' && (
                      <Link href="/admin" className="block rounded-xl px-3 py-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors">
                        Admin Panel
                      </Link>
                    )}
                  </div>
                  <form action={logout} className="border-t border-slate-100 dark:border-slate-800 p-1">
                    <ActionSubmitButton className="block w-full bg-transparent px-3 py-2 text-left text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-700 rounded-xl transition-colors">
                      Sign out
                    </ActionSubmitButton>
                  </form>
                </div>
              )}
            </div>
          ) : (
            <LoadingLink
              href="/login"
              className="ml-1 inline-flex items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Student Login
            </LoadingLink>
          )}
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 md:hidden" ref={mobileMenuRef}>
          <ThemeToggle size="sm" />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none shadow-xs"
            aria-expanded={mobileMenuOpen}
          >
            <span className="sr-only">Open main menu</span>
            {!mobileMenuOpen ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </button>

          {/* Mobile dropdown */}
          {mobileMenuOpen && (
            <div className="absolute right-4 top-16 mt-2 w-64 origin-top-right rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 shadow-2xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-150">
              {user && profile && (
                <div className="mb-2 border-b border-slate-100 dark:border-slate-800 px-3 pb-2.5">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {profile.full_name || (profile.role === 'admin' ? "Admin" : "Student")}
                  </p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                  {profile.role === 'admin' && (
                    <span className="mt-1.5 inline-block rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400">
                      Admin
                    </span>
                  )}
                </div>
              )}

              <div className="space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`block rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                      pathname === link.href
                        ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="mt-2 border-t border-slate-100 dark:border-slate-800 pt-2">
                {user && profile ? (
                  <div className="space-y-1">
                    <Link href="/dashboard" className="block rounded-xl px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium">
                      Dashboard
                    </Link>
                    <Link href="/dashboard/profile" className="block rounded-xl px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium">
                      Profile
                    </Link>
                    {profile.role === 'admin' && (
                      <Link href="/admin" className="block rounded-xl px-3 py-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50">
                        Admin Panel
                      </Link>
                    )}
                    <form action={logout}>
                      <ActionSubmitButton className="block w-full bg-transparent shadow-none border-none rounded-xl px-3 py-2 text-left text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 mt-1">
                        Sign out
                      </ActionSubmitButton>
                    </form>
                  </div>
                ) : (
                  <LoadingLink href="/login" className="mt-1 block rounded-xl bg-blue-600 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-700">
                    Student Login
                  </LoadingLink>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
