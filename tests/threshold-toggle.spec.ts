import { test, expect } from '@playwright/test';

test('threshold toggle on mobile via dev server', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('http://localhost:4321/');
  await page.waitForLoadState('networkidle');
  
  const toggle = page.locator('.threshold-toggle');
  await expect(toggle).toBeVisible();
  
  const bar = page.locator('.price-threshold-bar');
  await expect(bar).not.toHaveClass(/open/);
  
  await toggle.click();
  
  await expect(bar).toHaveClass(/open/);
});
