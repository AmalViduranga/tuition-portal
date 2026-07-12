import { test, expect } from '@playwright/test';

test.describe('Public Pages', () => {
  test('Home page loads successfully', async ({ page }) => {
    await page.goto('/');
    
    // Check if site title or logo is visible
    await expect(page).toHaveTitle(/AV Classes|MathsLK/i);
    
    // Verify important navigation links exist
    const loginLink = page.getByRole('link', { name: /login|sign in/i }).first();
    await expect(loginLink).toBeVisible();
  });

  test('Privacy Policy page loads', async ({ page }) => {
    await page.goto('/privacy-policy');
    
    const heading = page.getByRole('heading', { name: /privacy policy/i });
    await expect(heading).toBeVisible();
  });

  test('Terms and Conditions page loads', async ({ page }) => {
    await page.goto('/terms-and-conditions');
    
    const heading = page.getByRole('heading', { name: /terms/i });
    await expect(heading).toBeVisible();
  });

  test('Check for unexpected console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    
    // We expect no critical hydration or unhandled errors on the homepage
    expect(errors.length).toBe(0);
  });
});
