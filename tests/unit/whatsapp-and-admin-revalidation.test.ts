import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import {
  buildClassWhatsAppUrl,
  buildTelUrl,
  buildWhatsAppUrl,
  formatPhoneDisplay,
  normalizeWhatsAppNumber,
} from "@/lib/whatsapp";

const revalidatePathMock = vi.fn();
vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({
  revalidatePath: (...args: unknown[]) => revalidatePathMock(...args),
}));

const requireAdminApiMock = vi.fn();
vi.mock("@/lib/auth", () => ({
  requireAdminApi: () => requireAdminApiMock(),
}));

const createAdminClientMock = vi.fn();
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => createAdminClientMock(),
}));

import { POST as togglePost } from "@/app/api/admin/classes/toggle/route";
import { POST as createClassPost, PUT as updateClassPut } from "@/app/api/admin/classes/route";

describe("WhatsApp helper", () => {
  it("normalizes international and local Sri Lankan numbers to pure digits", () => {
    expect(normalizeWhatsAppNumber("+94753681070")).toBe("94753681070");
    expect(normalizeWhatsAppNumber("+94 75 368 1070")).toBe("94753681070");
    expect(normalizeWhatsAppNumber("0753681070")).toBe("94753681070");
    expect(normalizeWhatsAppNumber("")).toBe("94753681070");
  });

  it("formats phone numbers and builds tel and URL-encoded WhatsApp links", () => {
    expect(formatPhoneDisplay("+94753681070")).toBe("+94 75 368 1070");
    expect(buildTelUrl("+94753681070")).toBe("tel:+94753681070");
    expect(buildWhatsAppUrl()).toBe("https://wa.me/94753681070");

    const classUrl = buildClassWhatsAppUrl("2027 A/L Theory & Revision");
    expect(classUrl).toBe(
      "https://wa.me/94753681070?text=Hi%2C%20I%20would%20like%20to%20enquire%20about%20the%202027%20A%2FL%20Theory%20%26%20Revision%20Mathematics%20class."
    );
  });
});

describe("Admin class mutations revalidate public and student caches", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("revalidates homepage, schedule, public API, and portal paths after toggling class status", async () => {
    const updateEq = vi.fn().mockResolvedValue({ error: null });
    const update = vi.fn(() => ({ eq: updateEq }));
    const single = vi.fn().mockResolvedValue({ data: { is_active: true }, error: null });
    const selectEq = vi.fn(() => ({ single }));
    const select = vi.fn(() => ({ eq: selectEq }));
    const supabase = { from: vi.fn(() => ({ select, update })) };

    requireAdminApiMock.mockResolvedValue({ ok: true, supabase });

    const formData = new FormData();
    formData.set("class_id", "cls-2027-rev");
    const request = new NextRequest("http://localhost/api/admin/classes/toggle", {
      method: "POST",
      body: formData,
    });

    const response = await togglePost(request);
    expect(response.status).toBe(200);
    expect(update).toHaveBeenCalledWith({ is_active: false });
    expect(revalidatePathMock).toHaveBeenCalledWith("/");
    expect(revalidatePathMock).toHaveBeenCalledWith("/schedule");
    expect(revalidatePathMock).toHaveBeenCalledWith("/api/public/site-content");
    expect(revalidatePathMock).toHaveBeenCalledWith("/portal/classes");
    expect(revalidatePathMock).toHaveBeenCalledWith("/dashboard");
    expect(revalidatePathMock).toHaveBeenCalledWith("/admin/classes");
  });

  it("revalidates affected paths after creating or updating a class", async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    const updateEq = vi.fn().mockResolvedValue({ error: null });
    const update = vi.fn(() => ({ eq: updateEq }));
    createAdminClientMock.mockReturnValue({
      from: vi.fn(() => ({ insert, update })),
    });
    requireAdminApiMock.mockResolvedValue({ ok: true, supabase: {} });

    const createBody = new FormData();
    createBody.set("name", "2029 A/L");
    const createRes = await createClassPost(
      new NextRequest("http://localhost/api/admin/classes", { method: "POST", body: createBody })
    );
    expect(createRes.status).toBe(200);
    expect(revalidatePathMock).toHaveBeenCalledWith("/");
    expect(revalidatePathMock).toHaveBeenCalledWith("/schedule");

    revalidatePathMock.mockClear();

    const updateBody = new FormData();
    updateBody.set("class_id", "cls-1");
    updateBody.set("name", "2029 A/L Theory");
    const updateRes = await updateClassPut(
      new NextRequest("http://localhost/api/admin/classes", { method: "PUT", body: updateBody })
    );
    expect(updateRes.status).toBe(200);
    expect(revalidatePathMock).toHaveBeenCalledWith("/");
    expect(revalidatePathMock).toHaveBeenCalledWith("/schedule");
    expect(revalidatePathMock).toHaveBeenCalledWith("/api/public/site-content");
  });
});
