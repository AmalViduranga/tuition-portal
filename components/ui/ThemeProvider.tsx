"use client";

import React, { createContext, useContext, useEffect, useSyncExternalStore } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

let fallbackTheme: Theme = "light";
const THEME_EVENT = "mathslk-theme-change";

function readThemeSnapshot() {
  let theme: Theme = fallbackTheme;
  try {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") {
      theme = saved;
    } else {
      theme = "light";
    }
  } catch { /* Retain in-memory preference if storage is unavailable. */ }
  const resolved = theme === "dark" ? "dark" : "light";
  return `${theme}:${resolved}`;
}

function subscribeTheme(listener: () => void) {
  window.addEventListener("storage", listener);
  window.addEventListener(THEME_EVENT, listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(THEME_EVENT, listener);
  };
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const snapshot = useSyncExternalStore(subscribeTheme, readThemeSnapshot, () => "light:light");
  const [preference, resolved] = snapshot.split(":");
  const theme: Theme = preference === "dark" ? "dark" : "light";
  const resolvedTheme = resolved === "dark" ? "dark" : "light";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
    document.documentElement.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  const setTheme = (next: Theme) => {
    fallbackTheme = next;
    try { localStorage.setItem("theme", next); } catch { /* In-memory preference still works. */ }
    window.dispatchEvent(new Event(THEME_EVENT));
  };

  const toggleTheme = () => {
    const next = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    // Provide safe defaults when rendered outside provider (e.g. static tests)
    return {
      theme: "light" as Theme,
      resolvedTheme: "light" as "light" | "dark",
      setTheme: () => {},
      toggleTheme: () => {},
    };
  }
  return context;
}
