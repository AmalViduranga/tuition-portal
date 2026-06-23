import "server-only";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { AuditAction } from "./audit-actions";
import { NextRequest } from "next/server";

export function getSafeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "Unknown error occurred";
}

const SENSITIVE_KEYS = [
  "password",
  "tempPassword",
  "temporaryPassword",
  "token",
  "access_token",
  "refresh_token",
  "session",
  "cookie",
  "signedUrl",
  "privateUrl",
  "service_role",
  "authorization",
];

function sanitizeMetadata(metadata?: Record<string, unknown>): Record<string, unknown> {
  if (!metadata) return {};

  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(metadata)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = SENSITIVE_KEYS.some((sensitive) => lowerKey.includes(sensitive.toLowerCase()));

    if (!isSensitive) {
      // Truncate very long strings
      if (typeof value === "string" && value.length > 2000) {
        clean[key] = value.substring(0, 2000) + "... [truncated]";
      } else {
        clean[key] = value;
      }
    } else {
      clean[key] = "[REDACTED]";
    }
  }

  return clean;
}

export async function createAuditLog({
  actorId,
  actorEmail,
  actorRole,
  action,
  targetType,
  targetId,
  targetLabel,
  metadata = {},
  request,
}: {
  actorId?: string | null;
  actorEmail?: string | null;
  actorRole?: "admin" | "student" | string | null;
  action: AuditAction | string;
  targetType?: string | null;
  targetId?: string | null;
  targetLabel?: string | null;
  metadata?: Record<string, unknown>;
  request?: Request | NextRequest;
}): Promise<void> {
  try {
    const supabaseAdmin = createAdminClient();
    
    let ipAddress: string | null = null;
    let userAgent: string | null = null;

    try {
      const headersList = request ? request.headers : await headers();
      ipAddress =
        headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        headersList.get("x-real-ip") ||
        headersList.get("cf-connecting-ip") ||
        null;
      userAgent = headersList.get("user-agent") || null;
    } catch {
      // ignore header errors (e.g., if called in an environment where headers are not available)
    }

    const cleanMetadata = sanitizeMetadata(metadata);

    const { error } = await supabaseAdmin.from("audit_logs").insert({
      actor_id: actorId || null,
      actor_email: actorEmail || null,
      actor_role: actorRole || null,
      action,
      target_type: targetType || null,
      target_id: targetId || null,
      target_label: targetLabel || null,
      metadata: cleanMetadata,
      ip_address: ipAddress,
      user_agent: userAgent,
    });

    if (error) {
      console.error("[AUDIT LOG ERROR] Failed to insert audit log:", error);
    }
  } catch (error) {
    console.error("[AUDIT LOG ERROR] Unexpected error creating audit log:", getSafeErrorMessage(error));
  }
}
