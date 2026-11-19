import Link from "next/link";
import type { ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  href?: string;
  change?: number;
  changeLabel?: string;
  description?: string;
}

export default function StatsCard({
  title,
  value,
  icon,
  href,
  change,
  changeLabel = "from last month",
  description,
}: StatsCardProps) {
  const content = (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </p>
        <p className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>

        {change !== undefined && (
          <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold">
            <span
              className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 ${
                change >= 0
                  ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400"
                  : "bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400"
              }`}
            >
              {change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              <span>{Math.abs(change)}%</span>
            </span>
            <span className="text-slate-400 dark:text-slate-500 font-normal">{changeLabel}</span>
          </div>
        )}

        {description && !change && (
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{description}</p>
        )}
      </div>

      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/60 text-blue-600 dark:text-blue-400">
        {typeof icon === "string" ? (
          <span className="text-xl">{icon}</span>
        ) : (
          icon
        )}
      </div>
    </div>
  );

  const containerClasses =
    "block rounded-lg border border-border bg-card p-5 transition-colors hover:border-blue-400 dark:hover:border-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500";

  if (href) {
    return (
      <Link href={href} className={containerClasses}>
        {content}
      </Link>
    );
  }

  return <div className={containerClasses}>{content}</div>;
}
