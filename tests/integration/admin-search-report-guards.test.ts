import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { searchStudents } from "@/lib/admin/student-search";
import { loadEnrollmentReport } from "@/lib/server/enrollment-report";
import { GET as students } from "@/app/api/admin/students/route";
import { GET as earnings } from "@/app/api/admin/reports/enrollments/route";

vi.mock("@/lib/auth", () => ({ requireAdminApi: vi.fn() }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: vi.fn() }));
vi.mock("@/lib/admin/student-search", () => ({ searchStudents: vi.fn() }));
vi.mock("@/lib/server/enrollment-report", () => ({ loadEnrollmentReport: vi.fn() }));
vi.mock("@/lib/admin/create-student-account", () => ({ createStudentAccount: vi.fn() }));
vi.mock("@/lib/audit/audit-log", () => ({ createAuditLog: vi.fn() }));

beforeEach(() => vi.clearAllMocks());

describe("Existing admin authorization remains required", () => {
  it.each([401, 403])("denies search and financial reports with status %i before privileged reads", async status => {
    vi.mocked(requireAdminApi).mockResolvedValue({ ok: false, status, error: "Denied" });
    expect((await students(new NextRequest("http://localhost/api/admin/students?search=email"))).status).toBe(status);
    expect((await earnings()).status).toBe(status);
    expect(createAdminClient).not.toHaveBeenCalled();
    expect(searchStudents).not.toHaveBeenCalled();
    expect(loadEnrollmentReport).not.toHaveBeenCalled();
  });

  it("passes a trimmed-search request through the protected search helper", async () => {
    vi.mocked(requireAdminApi).mockResolvedValue({ ok: true } as Awaited<ReturnType<typeof requireAdminApi>>);
    const db = {} as ReturnType<typeof createAdminClient>;
    vi.mocked(createAdminClient).mockReturnValue(db);
    vi.mocked(searchStudents).mockResolvedValue({ students: [{ id: "existing-uuid", full_name: null, email: "student@example.com" }], hasMore: false });
    const response = await students(new NextRequest("http://localhost/api/admin/students?search=%20STUDENT%40%20"));
    expect(response.status).toBe(200);
    expect(searchStudents).toHaveBeenCalledWith(db, " STUDENT@ ");
    expect((await response.json()).students[0].id).toBe("existing-uuid");
  });
});
