import { describe, expect, it } from "vitest";
import { buildEnrollmentEarnings, colomboDateTime, enrollmentEarningsCsv, enrollmentIncome, type EnrollmentRecord } from "@/lib/reports/enrollment-earnings";

const row = (overrides: Partial<EnrollmentRecord> = {}): EnrollmentRecord => ({
  id: "enrollment-1", student_name: "Student", class_name: "Theory", access_mode: "paid", amount_paid: 1500,
  start_access_date: "2026-09-20", access_end_date: "2026-10-30", created_at: "2026-09-19T12:00:00Z",
  updated_at: "2026-11-08T05:00:00Z", ...overrides,
});

describe("Enrollment updated reporting", () => {
  it("uses updated_at for every monthly aggregate and retains the original access dates", () => {
    const records = [row()];
    const before = structuredClone(records);
    const november = buildEnrollmentEarnings(records, 10, 2026);
    expect(november.currentIncome).toBe(1500);
    expect(november.classBreakdown).toEqual([{ name: "Theory", income: 1500, students: 1 }]);
    expect(november.paidStudents).toBe(1);
    expect(buildEnrollmentEarnings(records, 8, 2026).currentIncome).toBe(0);
    expect(records).toEqual(before);
  });

  it("uses Asia/Colombo day, month, and year boundaries regardless of host timezone", () => {
    expect(colomboDateTime("2026-10-31T18:29:59Z")).toBe("2026-10-31 23:59:59");
    expect(colomboDateTime("2026-10-31T18:30:00Z")).toBe("2026-11-01 00:00:00");
    expect(colomboDateTime("2026-12-31T18:30:00Z")).toBe("2027-01-01 00:00:00");
    const records = [row({ updated_at: "2026-10-31T18:29:59Z" }), row({ id: "next", updated_at: "2026-10-31T18:30:00Z", amount_paid: 2000 })];
    expect(buildEnrollmentEarnings(records, 10, 2026)).toMatchObject({ currentIncome: 2000, prevIncome: 1500 });
    expect(buildEnrollmentEarnings([row({ updated_at: "2026-12-31T18:30:00Z" })], 0, 2027).currentIncome).toBe(1500);
  });

  it("preserves paid-positive inclusion and revoked-record treatment without merging payments", () => {
    const records = [row(), row({ id: "revoked", revoked_at: "2026-11-08T05:00:00Z" }), row({ id: "free", access_mode: "free_card" }), row({ id: "manual", access_mode: "manual" }), row({ id: "zero", amount_paid: 0 }), row({ id: "negative", amount_paid: -10 })];
    const originalTotal = enrollmentIncome(records);
    const moved = records.map(record => ({ ...record, updated_at: "2026-12-08T00:00:00Z" }));
    expect(originalTotal).toBe(3000);
    expect(enrollmentIncome(moved)).toBe(originalTotal);
    expect(buildEnrollmentEarnings(moved, 11, 2026).allTimeIncome).toBe(originalTotal);
    expect(buildEnrollmentEarnings(records, 10, 2026).currentIncome).toBe(3000);
  });

  it("sorts by update timestamp and reports missing dates without inventing one", () => {
    const records = [row(), row({ id: "newer", updated_at: "2026-11-09T00:00:00Z" }), row({ id: "missing", updated_at: null }), row({ id: "invalid", updated_at: "invalid" })];
    const report = buildEnrollmentEarnings(records, 10, 2026);
    expect(report.filteredRecords.map(record => record.id)).toEqual(["newer", "enrollment-1"]);
    expect(report.missingDates).toBe(2);
    expect(report.allTimeIncome).toBe(6000);
    expect(colomboDateTime(null)).toBeNull();
  });

  it("exports the reporting date separately from unchanged access dates and escapes CSV", () => {
    const csv = enrollmentEarningsCsv([row({ student_name: 'සිසු, "A"' })]);
    expect(csv).toContain('"Enrollment updated (Asia/Colombo)"');
    expect(csv).toContain('"2026-11-08 10:30:00 +05:30"');
    expect(csv).toContain('"2026-09-20","2026-10-30"');
    expect(csv).toContain('"සිසු, ""A"""');
    expect(enrollmentEarningsCsv([row({ student_name: "=SUM(A1)" })])).toContain("'=SUM(A1)");
  });

  it("documents the requested mutable-date behavior after a later update", () => {
    const original = row();
    const edited = { ...original, updated_at: "2026-12-01T00:00:00Z" };
    expect(buildEnrollmentEarnings([edited], 10, 2026).currentIncome).toBe(0);
    expect(buildEnrollmentEarnings([edited], 11, 2026).currentIncome).toBe(1500);
    expect(edited.start_access_date).toBe(original.start_access_date);
  });
});
