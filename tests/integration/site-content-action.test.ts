import { beforeEach, describe, expect, it, vi } from "vitest";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { updateSiteContent } from "@/app/admin/actions";

vi.mock("@/lib/auth", () => ({ requireAdmin: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: vi.fn() }));
vi.mock("@/lib/admin/create-student-account", () => ({ createStudentAccount: vi.fn() }));
vi.mock("@/lib/audit/audit-log", () => ({ createAuditLog: vi.fn() }));
beforeEach(() => vi.clearAllMocks());

describe("Site content save action", () => {
  it("retains the admin gate before writes", async () => {
    vi.mocked(requireAdmin).mockRejectedValueOnce(new Error("Denied"));
    await expect(updateSiteContent(new FormData())).rejects.toThrow("Denied");
    expect(revalidatePath).not.toHaveBeenCalled();
  });
  it.each([true, false])("revalidates public content only after a confirmed write: success=%s", async success => {
    const select = vi.fn(async () => success ? { data: [{ key: "teacher_name" }], error: null } : { data: null, error: { message: "denied" } });
    vi.mocked(requireAdmin).mockResolvedValue({
      supabase: { from: () => ({ upsert: () => ({ select }) }) }, user: { id: "admin-id", email: "admin@example.com" },
    } as unknown as Awaited<ReturnType<typeof requireAdmin>>);
    const form = new FormData(); form.set("teacher_name", "Teacher");
    if (success) {
      await updateSiteContent(form);
      expect(revalidatePath).toHaveBeenCalledWith("/");
    } else {
      await expect(updateSiteContent(form)).rejects.toThrow("could not be saved");
      expect(revalidatePath).not.toHaveBeenCalled();
    }
  });
});
