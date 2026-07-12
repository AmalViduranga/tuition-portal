"use client";

import React, { ReactNode } from "react";

type MaterialOpenLinkProps = {
  materialId: string;
  action?: "view" | "download";
  className?: string;
  children: ReactNode;
};

export function MaterialOpenLink({
  materialId,
  action = "view",
  className,
  children,
}: MaterialOpenLinkProps) {
  const href = `/api/student/materials/${materialId}/download?action=${action}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children}
    </a>
  );
}
