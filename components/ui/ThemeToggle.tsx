"use client";

import { useEffect, useState } from "react";
import { useTheme } from "./ThemeProvider";
import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
  className?: string;
  size?: "sm" | "md";
}

export default function ThemeToggle({ className = "", size = "md" }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : false;
  const iconSize = size === "sm" ? "h-4 w-4" : "h-4 w-4 sm:h-5 sm:w-5";
  const btnPadding = size === "sm" ? "p-1.5" : "p-2";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={`relative inline-flex items-center justify-center rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-100 hover:bg-slate-200/90 dark:bg-slate-900/80 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 shadow-xs backdrop-blur-md transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 active:scale-95 ${btnPadding} ${className}`}
    >
      <span className="sr-only">Toggle theme</span>
      {isDark ? (
        <Sun className={`${iconSize} text-amber-400 transition-transform duration-300 rotate-0 scale-100`} />
      ) : (
        <Moon className={`${iconSize} text-slate-800 transition-transform duration-300 rotate-0 scale-100`} />
      )}
    </button>
  );
}

