import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "mathslk_session_limit";
// 8 hours in milliseconds
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;

interface SessionPayload {
  id: string;
  issuedAt: number;
  expiresAt: number;
}

function getSecretKey(): string {
  const secret = process.env.SESSION_COOKIE_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SESSION_COOKIE_SECRET environment variable is missing in production.");
    }
    return "dev_fallback_secret_mathslk_session_limit";
  }
  return secret;
}

async function getCryptoKey(): Promise<CryptoKey> {
  const secret = getSecretKey();
  const encoder = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function arrayBufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToArrayBuffer(hex: string): ArrayBuffer {
  const view = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    view[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return view.buffer;
}

async function signPayload(payload: string): Promise<string> {
  const key = await getCryptoKey();
  const encoder = new TextEncoder();
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload)
  );
  return arrayBufferToHex(signatureBuffer);
}

export async function createSessionMarker(userId: string) {
  const issuedAt = Date.now();
  const expiresAt = issuedAt + SESSION_DURATION_MS;

  const payload: SessionPayload = { id: userId, issuedAt, expiresAt };
  const payloadBase64 = btoa(JSON.stringify(payload));
  const signature = await signPayload(payloadBase64);

  const token = `${payloadBase64}.${signature}`;

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 28800, // 8 hours in seconds
  });
}

export async function verifySessionMarker(userId: string): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return false;
  }

  const parts = token.split(".");
  if (parts.length !== 2) {
    return false;
  }

  const [payloadBase64, signature] = parts;
  
  try {
    const key = await getCryptoKey();
    const encoder = new TextEncoder();
    const signatureBuffer = hexToArrayBuffer(signature);
    
    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBuffer,
      encoder.encode(payloadBase64)
    );

    if (!isValid) return false;
  } catch {
    return false;
  }

  try {
    const payloadJson = atob(payloadBase64);
    const payload: SessionPayload = JSON.parse(payloadJson);

    if (payload.id !== userId) {
      return false;
    }

    if (Date.now() > payload.expiresAt) {
      return false;
    }

    // Protect against future-issued timestamps (e.g. clock drift > 5 mins)
    if (payload.issuedAt > Date.now() + 5 * 60 * 1000) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export async function clearSessionMarker() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getSessionExpiration(): Promise<number | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  
  try {
    const payloadJson = atob(parts[0]);
    const payload: SessionPayload = JSON.parse(payloadJson);
    return payload.expiresAt;
  } catch {
    return null;
  }
}
