"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export function SessionGuard({ expiresAt }: { expiresAt: number | null }) {
  const router = useRouter();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!expiresAt) return;

    function checkExpiration() {
      const now = Date.now();
      if (now >= expiresAt!) {
        // Clear any local client state if needed
        // Server will ultimately clear cookies, but we redirect proactively
        router.push("/login?reason=session_expired");
      }
    }

    // Check immediately on mount
    checkExpiration();

    // Setup visibility change listener (checks when device wakes up or tab becomes visible)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkExpiration();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Setup absolute timer for the exact expiration time if it's within standard bounds
    const remainingTime = expiresAt - Date.now();
    if (remainingTime > 0 && remainingTime <= 8 * 60 * 60 * 1000) {
      timerRef.current = setTimeout(() => {
        checkExpiration();
      }, remainingTime);
    }

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [expiresAt, router]);

  return null; // Silent component
}
