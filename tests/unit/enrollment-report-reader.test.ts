import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import { loadEnrollmentReport } from "@/lib/server/enrollment-report";

vi.mock("server-only", () => ({}));

describe("Enrollment report reader", () => {
  it("reads all enrollment pages without mixing in payment-period amounts", async () => {
    const rows = Array.from({ length: 5 }, (_, index) => ({
      id: `id-${index}`, amount_paid: 100, access_mode: "paid", start_access_date: "2026-09-01", access_end_date: "2026-10-11",
      created_at: "2026-09-01T00:00:00Z", updated_at: "2026-11-08T00:00:00Z", revoked_at: index === 1 ? "2026-11-08T00:00:00Z" : null,
      student: [{ full_name: `Student ${index}` }], class: { name: "Theory" },
    }));
    const range = vi.fn(async (start: number) => ({ data: rows.slice(start, start + 2), count: rows.length, error: null }));
    const chain = { select: vi.fn(() => chain), order: vi.fn(() => chain), range };
    const from = vi.fn<(table: string) => typeof chain>(() => chain);
    const report = await loadEnrollmentReport({ from } as unknown as SupabaseClient);
    expect(report).toHaveLength(5);
    expect(range.mock.calls.map(call => call[0])).toEqual([0, 2, 4]);
    expect(from.mock.calls.every(call => call[0] === "student_class_enrollments")).toBe(true);
    expect(report[1].revoked_at).toBe(rows[1].revoked_at);
    expect(report[0]).toMatchObject({ student_name: "Student 0", class_name: "Theory", start_access_date: "2026-09-01", updated_at: "2026-11-08T00:00:00Z" });
    expect(report[0]).not.toHaveProperty("student");
  });

  it.each([
    { data: null, error: { message: "updated_at missing" }, count: null },
    { data: [], error: null, count: 10 },
    { data: [], error: null, count: null },
  ])("fails visibly rather than returning a partial or fallback financial report", async result => {
    const chain = { select: () => chain, order: () => chain, range: vi.fn(async () => result) };
    await expect(loadEnrollmentReport({ from: () => chain } as unknown as SupabaseClient)).rejects.toBeTruthy();
  });

  it("rejects repeated rows rather than counting an enrollment twice", async () => {
    const repeated = { id: "same-id", amount_paid: 100, access_mode: "paid", start_access_date: "2026-09-01", access_end_date: null, created_at: "2026-09-01", updated_at: "2026-11-08T00:00:00Z", student: null, class: null };
    const chain = { select: () => chain, order: () => chain, range: vi.fn(async () => ({ data: [repeated], count: 2, error: null })) };
    await expect(loadEnrollmentReport({ from: () => chain } as unknown as SupabaseClient)).rejects.toThrow("repeated row");
  });
});
