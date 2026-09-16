"use client";
import { useFormStatus } from "react-dom";
import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ActionSubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loadingText?: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "outline";
}

export default function ActionSubmitButton({
  children,
  loadingText,
  disabled,
  className = "",
  ...props
}: ActionSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || disabled}
      aria-busy={pending}
      className={`relative inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 active:scale-[0.98] ${
        pending ? "cursor-not-allowed opacity-75 pointer-events-none" : ""
      } ${className}`}
      {...props}
    >
      {pending ? (
        <span className="flex items-center gap-2 justify-center">
          <svg className="animate-spin h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>{loadingText || "Processing..."}</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
