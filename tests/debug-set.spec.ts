import { test, expect } from '@playwright/test';
test('debug', async ({ page }) => {
  await page.goto('/set/mmq', { waitUntil: 'networkidle' });
  const html = await page.content();
  console.log('HAS set-page-group:', html.includes('set-page-group'));
  console.log('HAS set-page-header:', html.includes('set-page-header'));
  console.log('HAS price-threshold-bar:', html.includes('price-threshold-bar'));
  await page.screenshot({ path: '/tmp/set-mmq.png', fullPage: true });
});
