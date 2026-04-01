import type { HTMLAttributes } from "react";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "rectangular" | "circular";
}

export default function Skeleton({
  variant = "rectangular",
  className = "",
  ...props
}: SkeletonProps) {
  const baseClasses = "animate-pulse bg-slate-200";
  
  const variantClasses = {
    text: "h-3 w-full rounded",
    rectangular: "rounded-lg",
    circular: "rounded-full",
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}
