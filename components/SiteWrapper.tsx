"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import { SITE_NAME } from "@/lib/content";
import Link from "next/link";

interface SiteWrapperProps {
  children: React.ReactNode;
  user: any;
  profile: any;
}

export default function SiteWrapper({ children, user, profile }: SiteWrapperProps) {
  const pathname = usePathname();
  
  const isInternalRoute = 
    pathname.startsWith("/admin") || 
    pathname.startsWith("/portal") || 
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/change-password");

  if (isInternalRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar siteName={SITE_NAME} user={user} profile={profile} />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-10">
        {children}
      </main>
      
      <section className="border-t border-indigo-100 bg-white/80">
        <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 md:grid-cols-4">
          <div className="md:col-span-1">
            <h3 className="text-lg font-bold text-indigo-700 tracking-tight mb-3">MathsLK</h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-4">
              Master A/L Mathematics with confidence through structured learning, clear theories, and comprehensive past papers.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://www.youtube.com/@amalvidu"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-[#FF0000] hover:text-white transition-colors"
                aria-label="YouTube"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M21.764 7.218a2.536 2.536 0 00-1.782-1.8C18.411 5 12 5 12 5s-6.411 0-7.982.418a2.536 2.536 0 00-1.782 1.8C1.818 8.813 1.818 12 1.818 12s0 3.187.418 4.782A2.536 2.536 0 004.018 18.582C5.589 19 12 19 12 19s6.411 0 7.982-.418a2.536 2.536 0 001.782-1.8C22.182 15.187 22.182 12 22.182 12s0-3.187-.418-4.782zM9.75 14.99V9l5.528 2.99-5.528 3z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a
                href="https://www.facebook.com/share/1FadraTpVk/"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-[#1877F2] hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Quick Links</h3>
            <div className="mt-3 flex flex-col gap-2 text-sm">
              <Link href="/" className="text-slate-700 hover:text-indigo-700">Home</Link>
              <Link href="/about" className="text-slate-700 hover:text-indigo-700">About Teacher</Link>
              <Link href="/results" className="text-slate-700 hover:text-indigo-700">Previous Results</Link>
              <Link href="/schedule" className="text-slate-700 hover:text-indigo-700">Class Schedule</Link>
              <Link href="/contact" className="text-slate-700 hover:text-indigo-700">Contact</Link>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Student Access</h3>
            <div className="mt-3 flex flex-col gap-2 text-sm">
              <Link href="/login" className="text-slate-700 hover:text-indigo-700">Student Login</Link>
              <Link href="/dashboard" className="text-slate-700 hover:text-indigo-700">Dashboard</Link>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Legal</h3>
            <div className="mt-3 flex flex-col gap-2 text-sm">
              <Link href="/privacy-policy" className="text-slate-700 hover:text-indigo-700">Privacy Policy</Link>
              <Link href="/terms-and-conditions" className="text-slate-700 hover:text-indigo-700">Terms & Conditions</Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-indigo-100 bg-white/90">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-5 text-sm text-slate-600">
          <p className="w-full text-center sm:w-auto sm:text-left">© 2026 Amal Viduranga. All rights reserved.</p>
          <div className="flex w-full flex-wrap items-center justify-center gap-4 sm:w-auto">
            <Link href="/privacy-policy" className="hover:text-indigo-700">Privacy</Link>
            <span className="text-slate-300">|</span>
            <Link href="/terms-and-conditions" className="hover:text-indigo-700">Terms</Link>
            <span className="hidden sm:inline text-slate-300">|</span>
            <a
              href="https://www.linkedin.com/in/amal-viduranga-3a681b27b"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-indigo-600 hover:text-indigo-700 block w-full text-center sm:w-auto sm:inline"
            >
              Designed by Amal Viduranga
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
