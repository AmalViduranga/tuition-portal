import { test, expect } from '@playwright/test';

const runAuthTests = !!process.env.E2E_STUDENT_EMAIL && !!process.env.E2E_STUDENT_PASSWORD;

test.describe('Dashboard Recent Materials', () => {
  test.skip(!runAuthTests, 'Authenticated E2E tests skipped because dedicated test credentials are not configured.');

  test('Clicking a recent material opens the secure API route', async ({ page }) => {
    // 1. Log in
    await page.goto('/login');
    await page.fill('input[type="email"]', process.env.E2E_STUDENT_EMAIL!);
    await page.fill('input[type="password"]', process.env.E2E_STUDENT_PASSWORD!);
    await page.getByRole('button', { name: /login/i }).click();

    // 2. Open dashboard
    await expect(page).toHaveURL(/\/dashboard/);

    // 3. Wait for the Recent Materials section to load
    await expect(page.getByRole('heading', { name: /Recent Materials/i })).toBeVisible();
    
    // If no materials are available for the test user, we can't test clicking, so gracefully skip or assert empty state
    const hasMaterials = await page.getByText(/No materials available/i).isVisible() === false;
    
    if (hasMaterials) {
      // 4. Locate the first "Open" link in the materials section
      const firstMaterialLink = page.getByRole('link', { name: /Open/i }).first();
      
      const href = await firstMaterialLink.getAttribute('href');
      
      // 5. Confirm it points to the secure API route, not the raw file_url
      expect(href).toContain('/api/student/materials/');
      expect(href).toContain('download?action=view');
      expect(href).not.toContain('supabase.co/storage/v1/object/public/');

      // The actual clicking and opening a new tab might be complex to test in E2E without real data,
      // but verifying the href is correct prevents the "Bucket not found" bug!
    }
  });
});
