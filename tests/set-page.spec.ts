import { test, expect } from '@playwright/test';

/**
 * エキスパンション個別ページのテスト
 */

const randomDelay = (minMs: number, maxMs: number): Promise<void> =>
  new Promise((resolve) =>
    setTimeout(resolve, Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs)
  );

test('セットページへのリンクがトップページに存在する', async ({ page }) => {
  await randomDelay(1_000, 3_000);
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const setLink = page.locator('h2.set-title a.set-title-link').first();
  await expect(setLink).toBeAttached();
  await expect(setLink).toBeVisible();
});

test('セットページが表示されカードが存在する', async ({ page }) => {
  await randomDelay(1_000, 3_000);
  await page.goto('/set/mmq', { waitUntil: 'domcontentloaded' });

  // ページタイトルがセット名を含む
  await expect(page).toHaveTitle(/Mercadian Masques/);

  // カテゴリセクションが存在する
  const section = page.locator('section.set-page-group').first();
  await expect(section).toBeAttached();
  await expect(section).toBeVisible();

  // カードが1枚以上表示されている
  const cards = page.locator('.set-page-group .card');
  await expect(cards.first()).toBeAttached();
  await expect(cards.first()).toBeVisible();
});

test('セットページのカテゴリタイトルが表示される', async ({ page }) => {
  await randomDelay(1_000, 3_000);
  await page.goto('/set/mmq', { waitUntil: 'domcontentloaded' });

  const groupTitle = page.locator('h2.set-page-group-title').first();
  await expect(groupTitle).toBeAttached();
  await expect(groupTitle).toBeVisible();
});
