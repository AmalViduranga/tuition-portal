import type { HTMLAttributes } from "react";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "rectangular" | "circular";
}

export default function Skeleton({
  variant = "rectangular",
  className = "",
  ...props
}: SkeletonProps) {
  const baseClasses = "animate-pulse bg-slate-200/80 dark:bg-slate-800/80";

  const variantClasses = {
    text: "h-3 w-full rounded-md",
    rectangular: "rounded-xl",
    circular: "rounded-full",
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}
