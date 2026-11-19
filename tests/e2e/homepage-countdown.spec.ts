import { test, expect } from "@playwright/test";

test.describe("Homepage exam countdown", () => {
  test("shows the existing countdown before its configured date", async ({ page }) => {
    await page.clock.install({ time: new Date("2026-09-01T01:00:00Z") });
    await page.goto("/");
    await expect(page.getByText("2026 A/L Mathematics (07)", { exact: true })).toBeVisible();
    await expect(page.getByText("Days", { exact: true })).toBeVisible();
  });

  test("hides the expired countdown without inventing a new exam date", async ({ page }) => {
    await page.clock.install({ time: new Date("2026-11-08T00:00:00Z") });
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Current lessons" })).toBeVisible();
    await expect(page.getByText("Paper Starts In", { exact: true })).toHaveCount(0);
  });
});
