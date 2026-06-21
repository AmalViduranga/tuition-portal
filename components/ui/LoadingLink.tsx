"use client";
import Link, { LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import { useState, ReactNode } from "react";

interface LoadingLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>, LinkProps {
  children: ReactNode;
  loadingText?: ReactNode;
}

export default function LoadingLink({ children, loadingText, onClick, className = "", ...props }: LoadingLinkProps) {
  const [isNavigating, setIsNavigating] = useState(false);
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setIsNavigating(false);
  }

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) onClick(e);
    if (!e.defaultPrevented) {
      setIsNavigating(true);
    }
  };

  return (
    <Link 
      onClick={handleClick}
      className={`${className} ${isNavigating ? 'opacity-70 cursor-not-allowed pointer-events-none' : ''}`}
      {...props}
    >
      {isNavigating ? (
        <span className="flex items-center gap-2 justify-center">
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          {loadingText || children}
        </span>
      ) : children}
    </Link>
  );
}
