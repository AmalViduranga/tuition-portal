import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import { literalSearchPattern, searchStudents, type StudentOption } from "@/lib/admin/student-search";
import { matchesAccessSearch } from "@/lib/admin/access-search";

type Profile = StudentOption & { role: string; is_active?: boolean };
function database(rows: Profile[]) {
  const filters = vi.fn();
  const limits = vi.fn();
  const db = { from: vi.fn(() => {
    let selectedRole = "";
    let column: "full_name" | "email" | null = null;
    let pattern = "";
    let limit = 0;
    const chain = {
      select: vi.fn(() => chain),
      eq: vi.fn((_field: string, role: string) => { selectedRole = role; filters(_field, role); return chain; }),
      order: vi.fn(() => chain),
      limit: vi.fn((value: number) => { limit = value; limits(value); return chain; }),
      regexIMatch: vi.fn((field: "full_name" | "email", value: string) => { column = field; pattern = value; return chain; }),
      then: (resolve: (value: unknown) => unknown) => Promise.resolve({
        data: rows.filter(row => row.role === selectedRole && (!column || (row[column] !== null && new RegExp(pattern, "i").test(row[column]!))))
          .sort((a, b) => (a.full_name ?? "\uffff").localeCompare(b.full_name ?? "\uffff") || a.id.localeCompare(b.id)).slice(0, limit)
          .map(({ id, full_name, email }) => ({ id, full_name, email })), error: null,
      }).then(resolve),
    };
    return chain;
  }) };
  return { db: db as unknown as SupabaseClient, filters, limits };
}

const profiles: Profile[] = [
  { id: "one", full_name: "Nimal Perera", email: "Nimal@Example.com", role: "student" },
  { id: "two", full_name: "Nimal Perera", email: "other@example.com", role: "student", is_active: false },
  { id: "three", full_name: null, email: "email.only@example.com", role: "student" },
  { id: "four", full_name: "No Email", email: null, role: "student" },
  { id: "admin", full_name: "Nimal Admin", email: "nimal.admin@example.com", role: "admin" },
];

describe("Student search", () => {
  it.each([
    ["Nimal Perera", ["one", "two"]], ["  PERERA  ", ["one", "two"]],
    ["NIMAL@EXAMPLE.COM", ["one"]], ["mail.only", ["three"]], ["other@", ["two"]],
    ["No Email", ["four"]], ["missing@example.com", []],
  ])("matches full/partial names and emails: %s", async (input, ids) => {
    const { db, filters } = database(profiles);
    expect((await searchStudents(db, input)).students.map(row => row.id).sort()).toEqual([...ids].sort());
    expect(filters.mock.calls.every(call => call[0] === "role" && call[1] === "student")).toBe(true);
  });

  it("treats filter syntax, wildcards and regex characters literally", async () => {
    const input = 'A,.(x)%_*"\\One';
    const { db } = database([...profiles, { id: "special", full_name: input, email: null, role: "student" }]);
    expect((await searchStudents(db, input)).students.map(row => row.id)).toEqual(["special"]);
    expect(new RegExp(literalSearchPattern(".*"), "i").test("anything")).toBe(false);
    expect(new RegExp(literalSearchPattern(".*"), "i").test("literal .* text")).toBe(true);
  });

  it("finds a student beyond the initially loaded page and bounds results", async () => {
    const rows = Array.from({ length: 1500 }, (_, index) => ({ id: String(index), full_name: `Student ${String(index).padStart(4, "0")}`, email: `student${index}@example.com`, role: "student" }));
    const { db, limits } = database(rows);
    expect((await searchStudents(db, "student1499@")).students[0].id).toBe("1499");
    const all = await searchStudents(db, "student");
    expect(all.students).toHaveLength(50);
    expect(all.hasMore).toBe(true);
    expect(limits.mock.calls.every(call => call[0] === 51)).toBe(true);
  });

  it("deduplicates name/email matches by UUID and keeps inactive student eligibility", async () => {
    const result = await searchStudents(database(profiles).db, "Nimal");
    expect(result.students.map(row => row.id)).toEqual(["one", "two"]);
    expect(result.students.every(row => !Object.hasOwn(row, "role"))).toBe(true);
  });

  it("rejects oversized searches", async () => {
    await expect(searchStudents(database(profiles).db, "a".repeat(201))).rejects.toThrow("200");
  });

  it("retains student/class/resource matching in table searches and adds email", () => {
    expect(matchesAccessSearch(" THEORY ", null, null, "Theory Class")).toBe(true);
    expect(matchesAccessSearch("EXAMPLE", null, "student@example.com", null)).toBe(true);
    expect(matchesAccessSearch("nimal", "Nimal", null)).toBe(true);
    expect(matchesAccessSearch("   ", null)).toBe(true);
    expect(matchesAccessSearch("unknown", null, undefined)).toBe(false);
  });
});
