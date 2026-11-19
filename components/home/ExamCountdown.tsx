"use client";

import { useEffect, useState, useRef, useSyncExternalStore } from "react";
import { AL_2026_MATHEMATICS_07_START } from "@/lib/constants";

const subscribeToHydration = () => () => {};

interface ExamCountdownProps {
  variant?: "landing" | "compact";
}

export default function ExamCountdown({ variant = "landing" }: ExamCountdownProps) {
  const mounted = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false
  );
  const targetTimestamp = useRef(Date.parse(AL_2026_MATHEMATICS_07_START));
  const [remainingMs, setRemainingMs] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (isCompleted) return;
    const updateCountdown = () => {
      const now = Date.now();
      const diff = Math.max(targetTimestamp.current - now, 0);
      
      setRemainingMs(diff);
      
      if (diff === 0) {
        setIsCompleted(true);
      }
    };

    updateCountdown();

    const intervalId = setInterval(() => {
      updateCountdown();
    }, 1000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        updateCountdown();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isCompleted]);

  const days = Math.floor(remainingMs / 86_400_000);
  const hours = Math.floor((remainingMs % 86_400_000) / 3_600_000);
  const minutes = Math.floor((remainingMs % 3_600_000) / 60_000);
  const seconds = Math.floor((remainingMs % 60_000) / 1_000);

  const pad = (num: number) => num.toString().padStart(2, "0");

  const displayDays = mounted ? days.toString() : "--";
  const displayHours = mounted ? pad(hours) : "--";
  const displayMinutes = mounted ? pad(minutes) : "--";
  const displaySeconds = mounted ? pad(seconds) : "--";

  if (!mounted || isCompleted) {
    return null;
  }

  if (variant === "compact") {
    return (
      <div 
        className="text-xs sm:text-xs font-medium text-slate-500 dark:text-slate-400 tracking-tight tabular-nums mt-0.5"
        aria-label="2026 A/L Maths Paper Starts In"
        role="timer"
      >
        <div className="hidden lg:block">
          <span className="font-semibold text-slate-700 dark:text-slate-200">2026 A/L Maths</span> &bull; Paper Starts In &ndash; {displayDays}D {displayHours}H {displayMinutes}M {displaySeconds}S
        </div>
        <div className="lg:hidden flex flex-col leading-[1.1]">
          <span className="font-semibold text-slate-700 dark:text-slate-200">2026 A/L Maths</span>
          <span>Starts In &ndash; {displayDays}D {displayHours}H {displayMinutes}M {displaySeconds}S</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="w-full rounded-lg bg-card border border-border p-6 sm:p-8"
      aria-label="Time remaining until the 2026 A/L Mathematics paper."
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-border pb-4 mb-5">
        <h2 className="text-base font-semibold text-foreground">
          2026 A/L Mathematics (07)
        </h2>
        <p className="text-sm text-muted-foreground">Paper Starts In</p>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center" aria-hidden={!mounted}>
        <div className="flex flex-col rounded-lg bg-muted p-3 sm:p-4">
          <span className="text-2xl sm:text-4xl font-bold text-foreground tabular-nums">
            {displayDays}
          </span>
          <span className="text-xs sm:text-sm text-muted-foreground mt-1">Days</span>
        </div>
        <div className="flex flex-col rounded-lg bg-muted p-3 sm:p-4">
          <span className="text-2xl sm:text-4xl font-bold text-foreground tabular-nums">
            {displayHours}
          </span>
          <span className="text-xs sm:text-sm text-muted-foreground mt-1">Hours</span>
        </div>
        <div className="flex flex-col rounded-lg bg-muted p-3 sm:p-4">
          <span className="text-2xl sm:text-4xl font-bold text-foreground tabular-nums">
            {displayMinutes}
          </span>
          <span className="text-xs sm:text-sm text-muted-foreground mt-1">Minutes</span>
        </div>
        <div className="flex flex-col rounded-lg bg-muted p-3 sm:p-4">
          <span className="text-2xl sm:text-4xl font-bold text-foreground tabular-nums">
            {displaySeconds}
          </span>
          <span className="text-xs sm:text-sm text-muted-foreground mt-1">Seconds</span>
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">
          02 September 2026 &bull; 8:30 AM <br className="sm:hidden" />
          <span className="hidden sm:inline"> </span>
          Sri Lanka Time
        </p>
      </div>
    </div>
  );
}
