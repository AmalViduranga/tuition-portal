import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  buildPublicClassOffers,
  buildPublicLessons,
  pickPublicSettings,
  PUBLIC_SETTING_KEYS,
  type PublicContentResult,
} from "@/lib/public-content";

// This path deliberately does not read the visitor's cookies or session.
// Next's request-time callers use uncached reads; no settings table policy changes are needed.
// Active classes come directly from class_groups.is_active = true so deactivated classes
// are never resurrected by static fallback data.
export async function loadPublicContent(): Promise<PublicContentResult> {
  try {
    const admin = createAdminClient();
    const [settingsRes, classesRes] = await Promise.all([
      admin
        .from("site_settings")
        .select("key, value")
        .in("key", [...PUBLIC_SETTING_KEYS]),
      admin
        .from("class_groups")
        .select("id, name, description, is_active")
        .eq("is_active", true)
        .order("name", { ascending: true }),
    ]);

    if (settingsRes.error) throw settingsRes.error;
    if (classesRes.error) throw classesRes.error;

    const settings = pickPublicSettings(settingsRes.data ?? []);
    const classes = buildPublicClassOffers(classesRes.data ?? []);
    const lessons = buildPublicLessons(settings, classes);

    return { status: "ready", settings, classes, lessons };
  } catch {
    // Database details and server configuration must not reach the public response.
    return {
      status: "error",
      message: "Current lessons and classes could not be loaded right now.",
    };
  }
}
