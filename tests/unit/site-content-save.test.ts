import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import { saveSiteContent } from "@/lib/admin/site-content";

function client(result: unknown) {
  const select = vi.fn().mockResolvedValue(result);
  const upsert = vi.fn(() => ({ select }));
  const db = { from: vi.fn(() => ({ upsert })) };
  return { db: db as unknown as SupabaseClient, upsert };
}

describe("Site content saves", () => {
  it("saves submitted public keys in one statement without erasing omitted fields", async () => {
    const { db, upsert } = client({ data: [{ key: "current_lesson_2027_theory" }], error: null });
    const form = new FormData();
    form.set("current_lesson_2027_theory", "සිංහල / Lesson");
    form.set("private_key", "ignored");
    await saveSiteContent(db, form);
    expect(upsert).toHaveBeenCalledTimes(1);
    expect(upsert).toHaveBeenCalledWith([{ key: "current_lesson_2027_theory", value: "සිංහල / Lesson", updated_at: expect.any(String) }], { onConflict: "key" });
  });
  it("rejects returned database errors instead of reporting success", async () => {
    const form = new FormData(); form.set("teacher_name", "Teacher");
    await expect(saveSiteContent(client({ data: null, error: { message: "denied" } }).db, form)).rejects.toThrow("could not be saved");
    await expect(saveSiteContent(client({ data: [], error: null }).db, form)).rejects.toThrow("could not be saved");
  });
  it("rejects an empty form", async () => {
    await expect(saveSiteContent(client({ data: [], error: null }).db, new FormData())).rejects.toThrow("No site content");
  });
});
