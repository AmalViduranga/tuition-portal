"use client";

import { useEffect, useState, useRef, useSyncExternalStore } from "react";
import { AL_2026_MATHEMATICS_07_START } from "@/lib/constants";
import { Clock } from "lucide-react";

const subscribeToHydration = () => () => {};

export default function ExamCountdown() {
  const mounted = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false
  );
  const [remainingMs, setRemainingMs] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const targetTimestamp = useRef(Date.parse(AL_2026_MATHEMATICS_07_START));

  useEffect(() => {
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
  }, []);

  const days = Math.floor(remainingMs / 86_400_000);
  const hours = Math.floor((remainingMs % 86_400_000) / 3_600_000);
  const minutes = Math.floor((remainingMs % 3_600_000) / 60_000);
  const seconds = Math.floor((remainingMs % 60_000) / 1_000);

  const pad = (num: number) => num.toString().padStart(2, "0");

  const displayDays = mounted ? days.toString() : "--";
  const displayHours = mounted ? pad(hours) : "--";
  const displayMinutes = mounted ? pad(minutes) : "--";
  const displaySeconds = mounted ? pad(seconds) : "--";

  if (mounted && isCompleted) {
    return (
      <div className="mt-8 w-full rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 shadow-2xl p-6 text-center max-w-md mx-auto relative z-20">
        <div className="flex justify-center mb-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
            <Clock className="h-5 w-5 text-white" />
          </div>
        </div>
        <p className="text-white font-medium">The 2026 A/L Mathematics (07) paper has started.</p>
        <p className="text-slate-400 text-sm mt-2">02 September 2026 &bull; 8:30 AM Sri Lanka Time</p>
      </div>
    );
  }

  return (
    <div 
      className="mt-8 w-full rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 shadow-2xl p-6 relative z-20 max-w-md mx-auto"
      aria-label="Time remaining until the 2026 A/L Mathematics paper."
    >
      <div className="flex flex-col items-center border-b border-slate-700/50 pb-4 mb-4">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-widest mb-1">
          2026 A/L Mathematics (07)
        </h2>
        <p className="text-lg font-bold text-white">Paper Starts In</p>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center" aria-hidden={!mounted}>
        <div className="flex flex-col bg-slate-800/50 rounded-xl p-2 sm:p-3 border border-slate-700/30">
          <span className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-blue-200 tabular-nums">
            {displayDays}
          </span>
          <span className="text-[10px] sm:text-xs text-slate-400 font-medium uppercase mt-1">Days</span>
        </div>
        <div className="flex flex-col bg-slate-800/50 rounded-xl p-2 sm:p-3 border border-slate-700/30">
          <span className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-emerald-200 tabular-nums">
            {displayHours}
          </span>
          <span className="text-[10px] sm:text-xs text-slate-400 font-medium uppercase mt-1">Hours</span>
        </div>
        <div className="flex flex-col bg-slate-800/50 rounded-xl p-2 sm:p-3 border border-slate-700/30">
          <span className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-emerald-300 tabular-nums">
            {displayMinutes}
          </span>
          <span className="text-[10px] sm:text-xs text-slate-400 font-medium uppercase mt-1">Minutes</span>
        </div>
        <div className="flex flex-col bg-slate-800/50 rounded-xl p-2 sm:p-3 border border-slate-700/30">
          <span className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-200 to-slate-400 tabular-nums">
            {displaySeconds}
          </span>
          <span className="text-[10px] sm:text-xs text-slate-400 font-medium uppercase mt-1">Seconds</span>
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className="text-xs text-slate-400">
          02 September 2026 &bull; 8:30 AM <br className="sm:hidden" />
          <span className="hidden sm:inline"> </span>
          Sri Lanka Time
        </p>
      </div>
    </div>
  );
}
