import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildPublicClassOffers,
  buildPublicLessons,
  deriveClassFilters,
  pickPublicSettings,
  PUBLIC_SETTING_KEYS,
} from "@/lib/public-content";
import { createAdminClient } from "@/lib/supabase/admin";
import { loadPublicContent } from "@/lib/server/public-content";
import { GET } from "@/app/api/public/site-content/route";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: vi.fn() }));

const settingsIn = vi.fn();
const settingsSelect = vi.fn(() => ({ in: settingsIn }));

const classesOrder = vi.fn();
const classesEq = vi.fn(() => ({ order: classesOrder }));
const classesSelect = vi.fn(() => ({ eq: classesEq }));

const from = vi.fn((table: string) => {
  if (table === "site_settings") return { select: settingsSelect };
  if (table === "class_groups") return { select: classesSelect };
  throw new Error(`Unexpected table ${table}`);
});

const defaultActiveClasses = [
  { id: "cls-2027-th", name: "2027 A/L", description: "Core theory", is_active: true },
  { id: "cls-2027-rev", name: "2027 A/L Revision", description: "Revision batch", is_active: true },
  { id: "cls-2028-th", name: "2028 A/L", description: "New intake", is_active: true },
  { id: "cls-paper", name: "Paper Class 2027 A/L", description: "Past paper discussions", is_active: true },
];

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(createAdminClient).mockReturnValue({ from } as unknown as ReturnType<typeof createAdminClient>);
  settingsIn.mockResolvedValue({
    data: [
      { key: "current_lesson_2027_theory", value: "  අවකලනය / Differentiation  " },
      { key: "current_lesson_2027_revision", value: "සංකරණ හා සංයෝජන" },
      { key: "current_lesson_2028_theory", value: "සරල රේඛාව" },
    ],
    error: null,
  });
  classesOrder.mockResolvedValue({ data: defaultActiveClasses, error: null });
});

describe("Public content boundary and active class visibility", () => {
  it("reads active classes and configured lessons without needing a user session", async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.settings.current_lesson_2027_theory).toBe("අවකලනය / Differentiation");
    expect(body.classes.map((c: { id: string }) => c.id)).toEqual([
      "cls-2027-th",
      "cls-2027-rev",
      "cls-2028-th",
      "cls-paper",
    ]);
    expect(body.lessons.map((l: { key: string }) => l.key)).toEqual([
      "current_lesson_2027_theory",
      "current_lesson_2027_revision",
      "current_lesson_2028_theory",
    ]);
    expect(from).toHaveBeenCalledWith("site_settings");
    expect(from).toHaveBeenCalledWith("class_groups");
    expect(classesEq).toHaveBeenCalledWith("is_active", true);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  it("constructs only public fields even if extra rows or fields are returned", async () => {
    settingsIn.mockResolvedValue({
      error: null,
      data: [
        { key: "current_lesson_2027_theory", value: "Configured", private_profile: "private" },
        { key: "payment_secret", value: "private" },
      ],
    });
    classesOrder.mockResolvedValue({
      error: null,
      data: [{ id: "cls-2027-th", name: "2027 A/L", is_active: true, internal_secret: "private" }],
    });
    const body = await (await GET()).json();
    expect(Object.keys(body.settings).sort()).toEqual([...PUBLIC_SETTING_KEYS].sort());
    expect(JSON.stringify(body)).not.toContain("private");
    expect(JSON.stringify(body)).not.toContain("payment_secret");
  });

  it("excludes retired 2026 classes from offers and dynamic filters", () => {
    const offers = buildPublicClassOffers([
      { id: "c-2026-th", name: "2026 A/L Theory", is_active: true },
      { id: "c-2026-rev", name: "2026 A/L Revision", is_active: true },
      ...defaultActiveClasses,
    ]);
    expect(offers.some((c) => c.name.includes("2026"))).toBe(false);
    expect(deriveClassFilters(offers)).toEqual(["All classes", "2027", "2028", "Paper Class"]);
  });

  it("hides only the deactivated class when 1 of 2 same-year classes is deactivated", async () => {
    classesOrder.mockResolvedValueOnce({
      error: null,
      data: defaultActiveClasses.filter((c) => c.id !== "cls-2027-rev"),
    });
    const result = await loadPublicContent();
    expect(result.status).toBe("ready");
    if (result.status !== "ready") return;
    expect(result.classes.map((c) => c.id)).toEqual(["cls-2027-th", "cls-2028-th", "cls-paper"]);
    expect(result.lessons.map((l) => l.key)).toEqual([
      "current_lesson_2027_theory",
      "current_lesson_2028_theory",
    ]);
    expect(deriveClassFilters(result.classes)).toEqual(["All classes", "2027", "2028", "Paper Class"]);
  });

  it("returns an honest empty list without resurrecting fallback classes when all classes are inactive", async () => {
    classesOrder.mockResolvedValueOnce({ error: null, data: [] });
    const result = await loadPublicContent();
    expect(result.status).toBe("ready");
    if (result.status !== "ready") return;
    expect(result.classes).toEqual([]);
    expect(result.lessons).toEqual([]);
    expect(deriveClassFilters(result.classes)).toEqual([]);
  });

  it("returns the same content with anonymous, student and admin request-cookie fixtures", async () => {
    const publicRead: (request: Request) => Promise<Response> = GET;
    const bodies = [];
    for (const session of ["", "student-fixture", "admin-fixture"]) {
      const response = await publicRead(
        new Request("http://localhost/api/public/site-content", {
          headers: session ? { Cookie: `sb-test-auth-token=${session}` } : {},
        })
      );
      bodies.push(await response.json());
    }
    expect(bodies[0]).toEqual(bodies[1]);
    expect(bodies[1]).toEqual(bodies[2]);
  });

  it("does not cache earlier settings or active classes", async () => {
    await GET();
    settingsIn.mockResolvedValueOnce({
      error: null,
      data: [{ key: "current_lesson_2027_theory", value: "Updated lesson" }],
    });
    classesOrder.mockResolvedValueOnce({
      error: null,
      data: [{ id: "cls-2027-th", name: "2027 A/L", is_active: true }],
    });
    const body = await (await GET()).json();
    expect(body.settings.current_lesson_2027_theory).toBe("Updated lesson");
    expect(body.classes).toHaveLength(1);
    expect(body.lessons).toHaveLength(1);
  });

  it("returns empty titles truthfully and rejects invalid setting values", () => {
    const settings = pickPublicSettings([
      { key: "current_lesson_2027_theory", value: "  " },
      { key: "teacher_name", value: { password: "secret" } },
    ]);
    const offers = buildPublicClassOffers([{ id: "c1", name: "2027 A/L", is_active: true }]);
    const lessons = buildPublicLessons(settings, offers);
    expect(settings.current_lesson_2027_theory).toBeNull();
    expect(settings.teacher_name).toBeNull();
    expect(lessons[0]?.topic).toBeNull();
  });

  it("returns a sanitized 503 failure when site_settings or class_groups query fails", async () => {
    classesOrder.mockResolvedValueOnce({ error: { message: "private database failure" }, data: null });
    const response = await GET();
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      status: "error",
      message: "Current lessons and classes could not be loaded right now.",
    });
    vi.mocked(createAdminClient).mockImplementationOnce(() => {
      throw new Error("Missing server credential");
    });
    expect((await loadPublicContent()).status).toBe("error");
  });
});
