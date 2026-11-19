import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider, useTheme } from "@/components/ui/ThemeProvider";
import ThemeToggle from "@/components/ui/ThemeToggle";

let darkOs = false;
beforeEach(() => {
  darkOs = false;
  localStorage.clear();
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      matches: darkOs,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
  document.documentElement.classList.remove("dark");
});

function Preference() {
  const { theme, resolvedTheme } = useTheme();
  return <span>{theme}/{resolvedTheme}</span>;
}

describe("Theme preferences and first-visit light default", () => {
  it("defaults to light mode on first visit even when the OS prefers dark mode", () => {
    darkOs = true;
    render(
      <ThemeProvider>
        <Preference />
        <ThemeToggle />
      </ThemeProvider>
    );
    expect(screen.getByText("light/light")).toBeInTheDocument();
    expect(document.documentElement).not.toHaveClass("dark");
    expect(screen.getByRole("button", { name: "Switch to dark theme" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
  });

  it("loads an explicitly saved dark choice and persists user toggles", () => {
    localStorage.setItem("theme", "dark");
    render(
      <ThemeProvider>
        <Preference />
        <ThemeToggle />
      </ThemeProvider>
    );
    expect(screen.getByText("dark/dark")).toBeInTheDocument();
    expect(document.documentElement).toHaveClass("dark");
    const toggle = screen.getByRole("button", { name: "Switch to light theme" });
    expect(toggle).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(toggle);
    expect(localStorage.getItem("theme")).toBe("light");
    expect(document.documentElement).not.toHaveClass("dark");
    expect(screen.getByText("light/light")).toBeInTheDocument();
  });

  it("syncs saved preference changes from another tab via storage event", () => {
    render(
      <ThemeProvider>
        <Preference />
      </ThemeProvider>
    );
    expect(screen.getByText("light/light")).toBeInTheDocument();
    act(() => {
      localStorage.setItem("theme", "dark");
      window.dispatchEvent(new Event("storage"));
    });
    expect(screen.getByText("dark/dark")).toBeInTheDocument();
    expect(document.documentElement).toHaveClass("dark");
  });
});
