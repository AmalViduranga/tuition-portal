import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getStudentAccessContext, isItemAccessible, type AccessContext } from "@/lib/recordings/access-logic";

const empty = (): AccessContext => ({ recordingGrants: new Set(), materialGrants: new Set(), enrollments: [], paymentPeriods: [] });
const item = { id: "resource", class_id: "class", release_at: "2026-09-20", published: true };
const enrollment = { class_id: "class", access_mode: "paid", start_access_date: "2026-09-01", access_end_date: "2026-10-11" };

describe("Existing access semantics (unchanged)", () => {
  it.each(["paid", "free_card", "manual"])("retains %s enrollment access inside the release window", access_mode => {
    const context = { ...empty(), enrollments: [{ ...enrollment, access_mode }] };
    expect(isItemAccessible(item, context, "recording")).toBe(true);
    expect(isItemAccessible(item, context, "material")).toBe(true);
  });

  it("retains historical access after expiry, but not resources outside the window", () => {
    const context = { ...empty(), enrollments: [enrollment] };
    expect(isItemAccessible(item, context, "recording")).toBe(true);
    expect(isItemAccessible({ ...item, release_at: "2026-10-12" }, context, "recording")).toBe(false);
    expect(isItemAccessible({ ...item, release_at: "2026-08-31" }, context, "material")).toBe(false);
    expect(isItemAccessible(item, { ...empty(), enrollments: [{ ...enrollment, start_access_date: "2026-11-01" }] }, "recording")).toBe(false);
  });

  it.each(["pending", "rejected", "expired"])("does not grant access from a %s payment alone", status => {
    const context = { ...empty(), paymentPeriods: [{ class_id: "class", start_date: "2026-09-01", end_date: "2026-10-11", status }] };
    expect(isItemAccessible(item, context, "recording")).toBe(false);
  });

  it("keeps independent approved-payment and resource-specific manual grants", () => {
    const context = empty();
    context.recordingGrants.add(item.id);
    expect(isItemAccessible(item, context, "recording")).toBe(true);
    expect(isItemAccessible(item, context, "material")).toBe(false);
    context.materialGrants.add(item.id);
    expect(isItemAccessible(item, context, "material")).toBe(true);
    expect(isItemAccessible({ ...item, published: false }, context, "recording")).toBe(false);
    const approved = { ...empty(), paymentPeriods: [{ class_id: "class", start_date: "2026-09-01", end_date: "2026-10-11", status: "approved" }] };
    expect(isItemAccessible(item, approved, "recording")).toBe(true);
    expect(isItemAccessible({ ...item, class_id: "someone-else" }, approved, "material")).toBe(false);
  });

  it("loads only this student's non-revoked enrollments/unlocks without referencing reporting dates", async () => {
    const queries: Array<{ table: string; equalities: string[][]; nulls: string[]; fields: string }> = [];
    const db = { from: (table: string) => {
      const entry = { table, equalities: [] as string[][], nulls: [] as string[], fields: "" };
      queries.push(entry);
      const chain = {
        select: (fields: string) => { entry.fields = fields; return chain; },
        eq: (field: string, value: string) => { entry.equalities.push([field, value]); return chain; },
        is: (field: string) => { entry.nulls.push(field); return chain; },
        then: (resolve: (result: { data: [] }) => unknown) => Promise.resolve({ data: [] as [] }).then(resolve),
      };
      return chain;
    } };
    const context = await getStudentAccessContext(db as unknown as SupabaseClient, "existing-student-uuid");
    expect(queries).toHaveLength(4);
    expect(queries.every(query => query.equalities.some(pair => pair[0] === "student_id" && pair[1] === "existing-student-uuid"))).toBe(true);
    expect(queries.filter(query => query.table !== "student_class_payment_periods").every(query => query.nulls.includes("revoked_at"))).toBe(true);
    expect(queries.every(query => !query.fields.includes("updated_at"))).toBe(true);
    expect(isItemAccessible(item, context, "recording")).toBe(false);
    vi.restoreAllMocks();
  });
});
