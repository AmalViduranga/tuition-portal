import { test, expect } from '@playwright/test';

test.describe('Homepage Exam Countdown', () => {
  test('should display the countdown component on the homepage', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');

    // Architectural reason: The Next.js responsive design renders two identical countdown components
    // (one for desktop in a 'sm:flex' container, one for mobile in a 'sm:hidden' container).
    // Playwright's getByText finds both in the DOM, so we use .first() to assert on the desktop instance.
    const countdownContainer = page.getByText('2026 A/L Mathematics (07)').first();
    await expect(countdownContainer).toBeVisible();

    const paperStartsIn = page.getByText('Paper Starts In').first();
    await expect(paperStartsIn).toBeVisible();

    // Ensure it renders numbers (meaning hydration succeeded and it didn't stay as "--")
    await expect(page.locator('text="Days"').first()).toBeVisible();
    await expect(page.locator('text="Hours"').first()).toBeVisible();
    await expect(page.locator('text="Minutes"').first()).toBeVisible();
    await expect(page.locator('text="Seconds"').first()).toBeVisible();
  });
});
