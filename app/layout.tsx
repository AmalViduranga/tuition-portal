import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { SITE_NAME } from "@/lib/content";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${SITE_NAME} | A/L Mathematics`,
  description: "Tuition class website and student portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[radial-gradient(circle_at_top,_#eef2ff_0%,_#f8fafc_40%,_#f8fafc_100%)] text-slate-900">
        <header className="sticky top-0 z-40 border-b border-indigo-100 bg-white/85 backdrop-blur-xl">
          <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <Link href="/" className="text-base font-bold tracking-tight text-indigo-700 md:text-lg">
                {SITE_NAME}
              </Link>
              <span className="rounded-full bg-indigo-100 px-2 mt-0.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-indigo-700">
                Beta
              </span>
            </div>

            <div className="hidden items-center gap-2 text-sm md:flex">
              <Link href="/about" className="rounded-lg px-3 py-2 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700">
                About
              </Link>
              <Link href="/results" className="rounded-lg px-3 py-2 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700">
                Results
              </Link>
              <Link href="/schedule" className="rounded-lg px-3 py-2 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700">
                Schedule
              </Link>
              <Link href="/contact" className="rounded-lg px-3 py-2 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700">
                Contact
              </Link>
              <Link
                href="/login"
                className="ml-1 rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white shadow-sm hover:bg-indigo-700"
              >
                Student Login
              </Link>
            </div>

            <details className="relative md:hidden">
              <summary className="list-none rounded-lg border border-indigo-100 bg-white px-3 py-2 text-sm font-medium text-indigo-700">
                Menu
              </summary>
              <div className="absolute right-0 mt-2 w-48 rounded-xl border border-indigo-100 bg-white p-2 shadow-xl">
                <Link href="/about" className="block rounded-lg px-3 py-2 text-sm hover:bg-indigo-50">
                  About
                </Link>
                <Link href="/results" className="block rounded-lg px-3 py-2 text-sm hover:bg-indigo-50">
                  Results
                </Link>
                <Link href="/schedule" className="block rounded-lg px-3 py-2 text-sm hover:bg-indigo-50">
                  Schedule
                </Link>
                <Link href="/contact" className="block rounded-lg px-3 py-2 text-sm hover:bg-indigo-50">
                  Contact
                </Link>
                <Link href="/login" className="mt-1 block rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white">
                  Student Login
                </Link>
              </div>
            </details>
          </nav>
        </header>
        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-10">
          {children}
        </main>
        <section className="border-t border-indigo-100 bg-white/80">
          <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 md:grid-cols-3">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Quick Links</h3>
              <div className="mt-3 flex flex-col gap-2 text-sm">
                <Link href="/" className="text-slate-700 hover:text-indigo-700">
                  Home
                </Link>
                <Link href="/about" className="text-slate-700 hover:text-indigo-700">
                  About Teacher
                </Link>
                <Link href="/results" className="text-slate-700 hover:text-indigo-700">
                  Previous Results
                </Link>
                <Link href="/schedule" className="text-slate-700 hover:text-indigo-700">
                  Class Schedule
                </Link>
                <Link href="/contact" className="text-slate-700 hover:text-indigo-700">
                  Contact
                </Link>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Student Access</h3>
              <div className="mt-3 flex flex-col gap-2 text-sm">
                <Link href="/login" className="text-slate-700 hover:text-indigo-700">
                  Student Login
                </Link>
                <Link href="/dashboard" className="text-slate-700 hover:text-indigo-700">
                  Dashboard
                </Link>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Legal</h3>
              <div className="mt-3 flex flex-col gap-2 text-sm">
                <Link href="/privacy-policy" className="text-slate-700 hover:text-indigo-700">
                  Privacy Policy
                </Link>
                <Link href="/terms-and-conditions" className="text-slate-700 hover:text-indigo-700">
                  Terms & Conditions
                </Link>
              </div>
            </div>
          </div>
        </section>
        <footer className="border-t border-indigo-100 bg-white/90">
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-5 text-sm text-slate-600">
            <p>© 2026 Amal Viduranga. All rights reserved.</p>
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/privacy-policy" className="hover:text-indigo-700">
                Privacy Policy
              </Link>
              <Link href="/terms-and-conditions" className="hover:text-indigo-700">
                Terms & Conditions
              </Link>
              <a
                href="https://www.linkedin.com/in/amal-viduranga"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-indigo-600 hover:text-indigo-700"
              >
                Design by Amal Viduranga
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
