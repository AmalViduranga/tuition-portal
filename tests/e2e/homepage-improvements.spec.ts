import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {
  buildPublicClassOffers,
  buildPublicLessons,
  pickPublicSettings,
} from "../../lib/public-content";

test.beforeEach(async ({ baseURL, page }) => {
  if (!baseURL || !["localhost", "127.0.0.1", "[::1]"].includes(new URL(baseURL).hostname)) {
    throw new Error("Run these smoke checks on a local server only.");
  }
  await page.route("**/rest/v1/promotions?**", (route) => route.fulfill({ json: [] }));
});

const settings = pickPublicSettings([
  { key: "current_lesson_2027_theory", value: "අවකලනය සහ එහි යෙදීම් / Differentiation and its applications" },
  { key: "current_lesson_2027_revision", value: "සංකරණ හා සංයෝජන" },
]);

const activeClassRows = [
  { id: "cls-2027-th", name: "2027 A/L", description: "Core A/L Mathematics program for 2027 batch", is_active: true },
  { id: "cls-2027-rev", name: "2027 A/L Revision", description: "Revision class for 2027 A/L Students", is_active: true },
  { id: "cls-2028-th", name: "2028 A/L", description: "2028 A/L Theory intake", is_active: true },
  { id: "cls-paper", name: "Paper Class 2027 A/L", description: "Past paper discussions", is_active: true },
];

function buildPayload(rows = activeClassRows, customSettings = settings) {
  const classes = buildPublicClassOffers(rows);
  const lessons = buildPublicLessons(customSettings, classes);
  return { status: "ready" as const, settings: customSettings, classes, lessons };
}

test("first visit opens in light mode even when OS is dark, and saved dark preference persists", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.route("**/api/public/site-content", (route) => route.fulfill({ json: buildPayload() }));

  await page.goto("/");
  await expect(page.locator("html")).not.toHaveClass(/dark/);
  expect(await page.evaluate(() => localStorage.getItem("theme"))).toBeNull();

  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe("dark");

  await page.reload();
  await expect(page.locator("html")).toHaveClass(/dark/);

  await page.goto("/login");
  await expect(page.locator("html")).toHaveClass(/dark/);
});

test("hero puts Student Login first, Current lessons auto-refreshes without Refresh button, and 2026 is retired", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  let payload = buildPayload();
  await page.route("**/api/public/site-content", (route) => route.fulfill({ json: payload }));

  await page.goto("/");

  // Hero CTA order & hierarchy
  const hero = page.locator("section[aria-labelledby='home-heading']");
  const loginLink = hero.getByRole("link", { name: /Student Login/i });
  const findClassLink = hero.getByRole("link", { name: "Find your class", exact: true });
  await expect(loginLink).toBeVisible();
  await expect(findClassLink).toBeVisible();
  await expect(loginLink).toHaveAttribute("href", "/login");
  await expect(findClassLink).toHaveAttribute("href", "#classes");

  const loginBox = await loginLink.boundingBox();
  const findBox = await findClassLink.boundingBox();
  expect(loginBox).not.toBeNull();
  expect(findBox).not.toBeNull();
  expect(loginBox!.x).toBeLessThan(findBox!.x);

  // Current lessons: no Refresh button, Sinhala topic rendered, truthful empty state for unannounced 2028
  const lessonsSection = page.locator("#current-lessons");
  await expect(lessonsSection.getByRole("button", { name: /refresh/i })).toHaveCount(0);
  await expect(lessonsSection.getByText(settings.current_lesson_2027_theory!, { exact: true })).toBeVisible();
  await expect(lessonsSection.getByText("Topic to be announced", { exact: true })).toBeVisible();

  // Classes & times: no 2026 filter or 2026 class
  const classesSection = page.locator("#classes");
  await expect(classesSection.getByRole("button", { name: "2026", exact: true })).toHaveCount(0);
  await expect(classesSection.getByText("2026 A/L Theory")).toHaveCount(0);
  await expect(classesSection.getByText("2026 A/L Revision")).toHaveCount(0);

  // Dynamic filtering works
  await classesSection.getByRole("button", { name: "2028", exact: true }).click();
  await expect(classesSection.getByText("2028 A/L", { exact: true }).first()).toBeVisible();
  await expect(classesSection.getByText("2027 A/L Revision")).toHaveCount(0);
  await classesSection.getByRole("button", { name: "All classes", exact: true }).click();

  // Deactivating 1 of 2 same-year classes updates both Current lessons and Classes on focus
  payload = buildPayload(activeClassRows.filter((row) => row.id !== "cls-2027-rev"));
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(lessonsSection.getByText("2027 Revision")).toHaveCount(0);
  await expect(lessonsSection.getByText("2027 Theory")).toBeVisible();
  await expect(classesSection.getByText("2027 A/L Revision")).toHaveCount(0);
  await expect(classesSection.getByText("2027 A/L", { exact: true }).first()).toBeVisible();

  // Deactivating all classes shows honest empty states (no fallback resurrection)
  payload = buildPayload([]);
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(lessonsSection.getByText("No active class lessons are published right now.")).toBeVisible();
  await expect(classesSection.getByText(/No active classes are listed right now/i)).toBeVisible();
});

test("contact page and homepage closing band use official green Chat on WhatsApp button and Call link", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.route("**/api/public/site-content", (route) => route.fulfill({ json: buildPayload() }));

  await page.goto("/");
  const closingBand = page.locator("section[aria-labelledby='contact-heading']");
  const homeWa = closingBand.getByRole("link", { name: "Chat on WhatsApp" });
  await expect(homeWa).toBeVisible();
  await expect(homeWa).toHaveAttribute("href", /https:\/\/wa\.me\/94753681070\?text=/);
  expect(await homeWa.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe("rgb(37, 211, 102)");
  await expect(closingBand.getByRole("link", { name: /Call \+94 75 368 1070/i })).toHaveAttribute("href", "tel:+94753681070");

  await page.goto("/contact");
  const contactWa = page.getByRole("link", { name: "Chat on WhatsApp" });
  await expect(contactWa).toBeVisible();
  await expect(contactWa).toHaveAttribute("href", /https:\/\/wa\.me\/94753681070\?text=/);
  expect(await contactWa.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe("rgb(37, 211, 102)");
  await expect(page.getByRole("link", { name: /Call \+94 75 368 1070/i })).toHaveAttribute("href", "tel:+94753681070");

  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("login page has single navbar toggle, hides Student Login link, and fits 1366x768 and 1280x720 laptops", async ({ page }) => {
  for (const viewport of [
    { width: 1366, height: 768 },
    { width: 1280, height: 720 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/login");

    // Single visible theme toggle, no Back to Home, no Student Login self-link in header
    await expect(page.getByRole("button", { name: /Switch to (dark|light) theme/i })).toHaveCount(1);
    await expect(page.getByRole("link", { name: /Back to Home/i })).toHaveCount(0);
    await expect(page.locator("header").getByRole("link", { name: /Student Login/i })).toHaveCount(0);

    // Entire login form + recovery link fit within viewport height without clipping
    const forgotBox = await page.getByRole("link", { name: "Forgot your password?" }).boundingBox();
    const submitBox = await page.getByRole("button", { name: "Sign In" }).boundingBox();
    expect(forgotBox).not.toBeNull();
    expect(submitBox).not.toBeNull();
    expect(submitBox!.y + submitBox!.height).toBeLessThanOrEqual(viewport.height);
    expect(forgotBox!.y + forgotBox!.height).toBeLessThanOrEqual(viewport.height);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }

  // Mobile menu on /login also omits Student Login
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/login");
  await page.getByRole("button", { name: "Open main menu" }).click();
  await expect(page.locator("#mobile-menu").getByRole("link", { name: /Student Login/i })).toHaveCount(0);

  // Accessibility in light & dark modes
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto("/login");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

const viewports = [
  { name: "320", width: 320, height: 720 },
  { name: "360", width: 360, height: 800 },
  { name: "390", width: 390, height: 844 },
  { name: "768-portrait", width: 768, height: 1024 },
  { name: "1024-landscape", width: 1024, height: 768 },
  { name: "1280x720", width: 1280, height: 720 },
  { name: "1366x768", width: 1366, height: 768 },
  { name: "1440", width: 1440, height: 900 },
  { name: "1920", width: 1920, height: 1080 },
  { name: "2560", width: 2560, height: 1200 },
];

for (const vp of viewports) {
  test(`homepage responsive layout has no horizontal overflow at ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.route("**/api/public/site-content", (route) => route.fulfill({ json: buildPayload() }));
    await page.goto("/");
    await expect(page.getByText(settings.current_lesson_2027_theory!, { exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}

test("homepage supports keyboard focus, reduced motion, 200% zoom and light/dark Axe checks", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.route("**/api/public/site-content", (route) => route.fulfill({ json: buildPayload() }));
  await page.goto("/");
  await expect(page.getByText(settings.current_lesson_2027_theory!, { exact: true })).toBeVisible();

  const loginLink = page.locator("section[aria-labelledby='home-heading']").getByRole("link", { name: /Student Login/i });
  await loginLink.focus();
  expect(await page.evaluate(() => getComputedStyle(document.activeElement!).outlineStyle)).not.toBe("none");
  expect(await loginLink.evaluate((el) => getComputedStyle(el).transitionDuration)).toBe("0s");

  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  // 200% zoom equivalent (683x384 CSS viewport for 1366x768)
  await page.setViewportSize({ width: 683, height: 384 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
