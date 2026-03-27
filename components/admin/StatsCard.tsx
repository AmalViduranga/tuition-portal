import type { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: number;
  icon: string;
  href?: string;
  change?: number;
  changeLabel?: string;
}

export default function StatsCard({
  title,
  value,
  icon,
  href,
  change,
  changeLabel = "from last month"
}: StatsCardProps) {
  const content = (
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-600">{title}</p>
        <p className="mt-2 text-3xl font-bold text-slate-900">{value.toLocaleString()}</p>
        {change !== undefined && (
          <p className={`mt-1 text-sm ${change >= 0 ? "text-green-600" : "text-red-600"}`}>
            {change >= 0 ? "↑" : "↓"} {Math.abs(change)}% {changeLabel}
          </p>
        )}
      </div>
      <div className="text-3xl">{icon}</div>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block rounded-xl bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
        {content}
      </a>
    );
  }

  return <div className="rounded-xl bg-white p-6 shadow-sm">{content}</div>;
}
