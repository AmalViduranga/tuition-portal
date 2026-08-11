"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { logout } from "@/app/login/actions";

import { ActionSubmitButton, LoadingLink } from "@/components/ui";
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
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMobileMenuOpen(false);
    setProfileMenuOpen(false);
  }

  // Hide main navbar on internal dashboard/portal/admin routes to prevent duplication
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
    <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/80 backdrop-blur-2xl shadow-sm transition-all duration-300">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2 md:gap-3">
          <Link href="/" className="flex items-center hover:opacity-90 transition-opacity shrink-0" aria-label="Home">
            <Image
              src="/AV_Logo_01-removebg-preview.png"
              alt="AV Classes Logo"
              width={42}
              height={42}
              priority
              className="h-8 w-8 md:h-10 md:w-10 object-contain"
            />
          </Link>
          <div className="flex flex-col justify-center gap-0.5">
            <Link href="/" className="hidden sm:block text-base font-bold tracking-tight text-blue-700 md:text-lg hover:opacity-90 transition-opacity leading-none md:leading-none">
              {siteName}
            </Link>
            <ExamCountdown variant="compact" />
          </div>
        </div>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-2 text-sm md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-2 ${
                pathname === link.href
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-slate-700 hover:bg-blue-50 hover:text-blue-700"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {user && profile ? (
            <div className="relative ml-2" ref={profileMenuRef}>
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-700">
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
                <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl border border-slate-200 bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="border-b border-slate-100 px-4 py-2">
                    <p className="text-xs text-slate-500">Signed in as</p>
                    <p className="truncate text-sm font-medium text-slate-900">{user.email}</p>
                    {profile.role === 'admin' && (
                      <span className="mt-1 inline-block rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-700">
                        Admin
                      </span>
                    )}
                  </div>
                  <Link href="/dashboard" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900">
                    Dashboard
                  </Link>
                  <Link href="/dashboard/profile" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900">
                    Profile
                  </Link>
                  {profile.role === 'admin' && (
                    <Link href="/admin" className="block px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900">
                      Admin Panel
                    </Link>
                  )}
                  <form action={logout} className="border-t border-slate-100">
                    <ActionSubmitButton className="block w-full bg-transparent px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 hover:text-red-700 shadow-none border-none rounded-none">
                      Sign out
                    </ActionSubmitButton>
                  </form>
                </div>
              )}
            </div>
          ) : (
            <LoadingLink
              href="/login"
              className="ml-1 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white shadow-sm hover:bg-blue-700 inline-flex"
            >
              Student Login
            </LoadingLink>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden" ref={mobileMenuRef}>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center justify-center rounded-lg border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-50 hover:text-slate-900 focus:outline-none shadow-sm"
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
            <div className="absolute right-4 top-16 mt-2 w-56 origin-top-right rounded-xl border border-slate-200 bg-white p-2 shadow-xl ring-1 ring-black ring-opacity-5">
              {user && profile && (
                <div className="mb-2 border-b border-slate-100 px-3 pb-2">
                  <p className="text-sm font-medium text-slate-900">
                    {profile.full_name || (profile.role === 'admin' ? "Admin" : "Student")}
                  </p>
                  <p className="truncate text-xs text-slate-500">{user.email}</p>
                  {profile.role === 'admin' && (
                    <span className="mt-1 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-700">
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
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-slate-700 hover:bg-blue-50"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              <div className="mt-2 border-t border-slate-100 pt-2">
                {user && profile ? (
                  <>
                    <Link href="/dashboard" className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900">
                      Dashboard
                    </Link>
                    <Link href="/dashboard/profile" className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900">
                      Profile
                    </Link>
                    {profile.role === 'admin' && (
                      <Link href="/admin" className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900">
                        Admin Panel
                      </Link>
                    )}
                    <form action={logout}>
                      <ActionSubmitButton className="block w-full bg-transparent shadow-none border-none rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 hover:text-red-700 mt-1">
                        Sign out
                      </ActionSubmitButton>
                    </form>
                  </>
                ) : (
                  <LoadingLink href="/login" className="mt-1 block rounded-lg bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white">
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
