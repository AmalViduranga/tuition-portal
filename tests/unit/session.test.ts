import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createSessionMarker, verifySessionMarker, clearSessionMarker, getSessionExpiration } from "@/lib/auth/session";

// Mock next/headers
const mockCookies = {
  set: vi.fn(),
  get: vi.fn(),
  delete: vi.fn(),
};

vi.mock("next/headers", () => ({
  cookies: () => mockCookies,
}));

describe("Session Marker (8-hour limit)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T10:00:00Z"));
    process.env.SESSION_COOKIE_SECRET = "test_secret_for_ci_builds_must_be_32_chars";
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should create a session marker with 8 hours expiration", async () => {
    await createSessionMarker("user123");
    
    expect(mockCookies.set).toHaveBeenCalledWith(
      "mathslk_session_limit",
      expect.any(String),
      expect.objectContaining({
        maxAge: 28800, // 8 hours
        httpOnly: true,
      })
    );
  });

  it("should verify a valid session marker", async () => {
    await createSessionMarker("user123");
    
    // Extract the token that was just set
    const token = mockCookies.set.mock.calls[0][1];
    mockCookies.get.mockReturnValue({ value: token });

    // Should be valid right after creation
    const isValid = await verifySessionMarker("user123");
    expect(isValid).toBe(true);
  });

  it("should reject a session marker for a different user", async () => {
    await createSessionMarker("user123");
    const token = mockCookies.set.mock.calls[0][1];
    mockCookies.get.mockReturnValue({ value: token });

    // Verification for a different user should fail
    const isValid = await verifySessionMarker("user999");
    expect(isValid).toBe(false);
  });

  it("should reject an expired session marker (exactly at 8 hours)", async () => {
    await createSessionMarker("user123");
    const token = mockCookies.set.mock.calls[0][1];
    mockCookies.get.mockReturnValue({ value: token });

    // Advance time by exactly 8 hours + 1 ms
    vi.advanceTimersByTime(8 * 60 * 60 * 1000 + 1);

    const isValid = await verifySessionMarker("user123");
    expect(isValid).toBe(false);
  });

  it("should reject a session marker if time is suspiciously in the future", async () => {
    await createSessionMarker("user123");
    const token = mockCookies.set.mock.calls[0][1];
    mockCookies.get.mockReturnValue({ value: token });

    // Rewind system time to before it was issued (simulating issued in the future)
    vi.setSystemTime(new Date("2026-01-01T09:00:00Z"));

    const isValid = await verifySessionMarker("user123");
    expect(isValid).toBe(false);
  });

  it("should reject malformed or tampered token", async () => {
    await createSessionMarker("user123");
    const token = mockCookies.set.mock.calls[0][1];
    
    // Tamper with the token
    const tamperedToken = token.replace("a", "b");
    mockCookies.get.mockReturnValue({ value: tamperedToken });

    const isValid = await verifySessionMarker("user123");
    expect(isValid).toBe(false);
  });
  
  it("should reject when cookie is missing", async () => {
    mockCookies.get.mockReturnValue(undefined);

    const isValid = await verifySessionMarker("user123");
    expect(isValid).toBe(false);
  });

  it("should clear session marker correctly", async () => {
    await clearSessionMarker();
    expect(mockCookies.delete).toHaveBeenCalledWith("mathslk_session_limit");
  });

  it("should extract expiration safely", async () => {
    await createSessionMarker("user123");
    const token = mockCookies.set.mock.calls[0][1];
    mockCookies.get.mockReturnValue({ value: token });

    const expiresAt = await getSessionExpiration();
    // 10:00:00 + 8 hours = 18:00:00
    expect(expiresAt).toBe(new Date("2026-01-01T18:00:00Z").getTime());
  });
});
