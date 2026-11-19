import type { SupabaseClient } from "@supabase/supabase-js";
import { PUBLIC_SETTING_KEYS } from "@/lib/public-content";

export async function saveSiteContent(db: SupabaseClient, formData: FormData) {
  const updatedAt = new Date().toISOString();
  // Only submitted, supported keys are changed; omitted fields must not be erased.
  const updates = PUBLIC_SETTING_KEYS.filter(key => formData.has(key)).map(key => ({
    key, value: String(formData.get(key) ?? ""), updated_at: updatedAt,
  }));
  if (!updates.length) throw new Error("No site content was submitted.");
  // One statement prevents a partially saved form from being reported as successful.
  const { data, error } = await db.from("site_settings").upsert(updates, { onConflict: "key" }).select("key");
  if (error || !data || data.length !== updates.length) throw new Error("Site content could not be saved. Please try again.");
  return updates;
}
