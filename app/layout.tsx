import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { SITE_NAME } from "@/lib/content";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    profile = data;
  }
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[radial-gradient(circle_at_top,_#eef2ff_0%,_#f8fafc_40%,_#f8fafc_100%)] text-slate-900">
        <Navbar siteName={SITE_NAME} user={user} profile={profile} />
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
                href="https://www.linkedin.com/in/amal-viduranga-3a681b27b?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-indigo-600 hover:text-indigo-700"
              >
                Designed by Amal Viduranga
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
