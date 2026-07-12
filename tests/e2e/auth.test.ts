import { test, expect } from '@playwright/test';

// These tests only run if the environment variables are explicitly provided
const runAuthTests = !!process.env.E2E_STUDENT_EMAIL && !!process.env.E2E_STUDENT_PASSWORD;

test.describe('Authentication Flows', () => {
  test.skip(!runAuthTests, 'Skipping authenticated tests because E2E credentials are not provided.');

  test('Student can log in and view dashboard', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="email"]', process.env.E2E_STUDENT_EMAIL!);
    await page.fill('input[type="password"]', process.env.E2E_STUDENT_PASSWORD!);
    await page.getByRole('button', { name: /login/i }).click();

    // Verify successful login navigation to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    
    const dashboardHeading = page.getByRole('heading', { name: /dashboard/i });
    await expect(dashboardHeading).toBeVisible();
    
    // Test logout
    await page.getByRole('button', { name: /logout|sign out/i }).click();
    await expect(page).toHaveURL(/\/login/);
    
    // Test protected route rejection
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });
});
