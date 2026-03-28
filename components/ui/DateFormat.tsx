import type { ReactNode } from "react";

export interface DateFormatProps {
  date: string | Date;
  format?: "short" | "long" | "full" | "time";
  className?: string;
}

export default function DateFormat({ date, format: formatType = "short", className = "" }: DateFormatProps) {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  const formats: Record<string, Intl.DateTimeFormatOptions> = {
    short: { month: "short", day: "numeric", year: "numeric" },
    long: { month: "long", day: "numeric", year: "numeric" },
    full: { weekday: "long", month: "long", day: "numeric", year: "numeric" },
    time: { hour: "numeric", minute: "2-digit", hour12: true },
  };

  try {
    return <span className={className}>{dateObj.toLocaleDateString("en-US", formats[formatType])}</span>;
  } catch {
    return <span className={className}>{String(date)}</span>;
  }
}
