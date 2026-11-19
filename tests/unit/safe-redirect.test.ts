import { describe, expect, it } from "vitest";
import { safeNextPath } from "@/lib/utils/safe-redirect";

describe("safeNextPath", () => {
  it("keeps ordinary same-site paths", () => {
    expect(safeNextPath("/dashboard", "/x")).toBe("/dashboard");
    expect(safeNextPath("/portal/class/abc?tab=1#top", "/x")).toBe("/portal/class/abc?tab=1#top");
    expect(safeNextPath("/reset-password", "/x")).toBe("/reset-password");
  });

  it.each([
    "//evil.example",
    "/\\evil.example",
    "\\\\evil.example",
    "@evil.example",
    "https://evil.example",
    "javascript:alert(1)",
    "evil.example",
    "/\t/evil.example",
    "/\n/evil.example",
    "",
  ])("rejects %j", value => {
    expect(safeNextPath(value, "/fallback")).toBe("/fallback");
  });

  it("rejects non-string input", () => {
    expect(safeNextPath(undefined, "/fallback")).toBe("/fallback");
    expect(safeNextPath(["/a", "/b"], "/fallback")).toBe("/fallback");
  });

  it("normalises dot segments without leaving the site", () => {
    expect(safeNextPath("/a/../../portal", "/x")).toBe("/portal");
  });
});
