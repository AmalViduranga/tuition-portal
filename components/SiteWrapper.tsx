"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import { SITE_NAME } from "@/lib/content";
import Link from "next/link";
import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';
import { LoadingLink } from "@/components/ui";
import styles from "./public-shell.module.css";

interface SiteWrapperProps {
  children: React.ReactNode;
  user: { email?: string; id?: string } | null;
  profile: { full_name?: string; role?: string } | null;
}

const footerLink = "inline-flex min-h-9 items-center text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline";

export default function SiteWrapper({ children, user, profile }: SiteWrapperProps) {
  const pathname = usePathname();

  const isInternalRoute =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/portal") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/change-password");

  if (isInternalRoute) {
    return (
      <>
        <ProgressBar
          height="3px"
          color="#1d4ed8"
          options={{ showSpinner: false }}
          shallowRouting
        />
        {children}
      </>
    );
  }

  const isLoginRoute = pathname === "/login";

  return (
    <div className={styles.shell}>
      <ProgressBar
        height="3px"
        color="#1d4ed8"
        options={{ showSpinner: false }}
        shallowRouting
      />
      <Navbar siteName={SITE_NAME} user={user} profile={profile} />
      <main
        className={
          isLoginRoute
            ? "container-fluid flex flex-1 flex-col justify-center py-4 sm:py-6"
            : "container-fluid flex flex-1 flex-col py-8 sm:py-10"
        }
      >
        {children}
      </main>

      {!isLoginRoute && (
      <footer className="border-t border-border bg-card">
        <div className="container-fluid grid gap-x-10 gap-y-8 py-10 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))]">
          <div>
            <p className="text-base font-bold text-foreground">{SITE_NAME}</p>
            <p className="mt-2 max-w-[42ch] text-sm leading-relaxed text-muted-foreground">
              G.C.E. A/L Mathematics classes taught online, with recordings and class materials in the student portal.
            </p>
          </div>

          <nav aria-label="Site">
            <h2 className="text-sm font-semibold text-foreground">Site</h2>
            <div className="mt-2 flex flex-col">
              <Link href="/about" className={footerLink}>About the teacher</Link>
              <Link href="/results" className={footerLink}>Results</Link>
              <Link href="/schedule" className={footerLink}>Class schedule</Link>
              <Link href="/contact" className={footerLink}>Contact</Link>
            </div>
          </nav>

          <nav aria-label="Students">
            <h2 className="text-sm font-semibold text-foreground">Students</h2>
            <div className="mt-2 flex flex-col">
              {user ? (
                <Link href="/dashboard" className={footerLink}>Dashboard</Link>
              ) : (
                <LoadingLink href="/login" className={footerLink}>Student login</LoadingLink>
              )}
              <Link href="/privacy-policy" className={footerLink}>Privacy policy</Link>
              <Link href="/terms-and-conditions" className={footerLink}>Terms &amp; conditions</Link>
            </div>
          </nav>

          <nav aria-label="Follow">
            <h2 className="text-sm font-semibold text-foreground">Follow</h2>
            <div className="mt-2 flex flex-col">
              <a href="https://www.youtube.com/@amalvidu" target="_blank" rel="noopener noreferrer" className={footerLink}>YouTube</a>
              <a href="https://www.facebook.com/share/1FadraTpVk/" target="_blank" rel="noopener noreferrer" className={footerLink}>Facebook</a>
            </div>
          </nav>
        </div>

        <div className="border-t border-border">
          <div className="container-fluid flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-5 text-sm text-muted-foreground">
            <p>© 2026 Amal Viduranga. All rights reserved.</p>
            <a
              href="https://www.linkedin.com/in/amal-viduranga-3a681b27b"
              target="_blank"
              rel="noopener noreferrer"
              className="underline-offset-4 hover:text-foreground hover:underline"
            >
              Designed by Amal Viduranga
            </a>
          </div>
        </div>
      </footer>
      )}
    </div>
  );
}
