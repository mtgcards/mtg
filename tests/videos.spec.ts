import { test, expect } from '@playwright/test';

// 短い遅延（サーバー負荷分散用）- CIでは並列実行で分散されるため短縮
const randomDelay = (minMs: number, maxMs: number): Promise<void> =>
  new Promise(resolve =>
    setTimeout(resolve, Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs)
  );

test('動画ページが表示される', async ({ page }) => {
  await randomDelay(3_000, 8_000);
  await page.goto('/videos', { waitUntil: 'domcontentloaded' });

  // ページタイトルが存在する
  await expect(page.locator('h1')).toBeVisible();

  // 動画カードが1件以上表示される
  await expect(page.locator('.video-card').first()).toBeVisible();
});

test('動画カードにサムネイル・タイトル・チャンネル名が表示される', async ({ page }) => {
  await randomDelay(3_000, 8_000);
  await page.goto('/videos', { waitUntil: 'domcontentloaded' });

  const firstCard = page.locator('.video-card').first();
  await expect(firstCard.locator('img')).toBeVisible();
  await expect(firstCard.locator('.video-title')).toBeVisible();
  await expect(firstCard.locator('.video-channel')).toBeVisible();
});

test('動画カードをクリックするとモーダルが開く', async ({ page }) => {
  await randomDelay(3_000, 8_000);
  await page.goto('/videos', { waitUntil: 'domcontentloaded' });

  await page.locator('.video-card').first().click();

  // dialog が open 状態になる
  const dialog = page.locator('dialog.video-modal');
  await expect(dialog).toBeVisible();
});

test('モーダル内の iframe が YouTube 埋め込み URL を持つ', async ({ page }) => {
  await randomDelay(3_000, 8_000);
  await page.goto('/videos', { waitUntil: 'domcontentloaded' });

  await page.locator('.video-card').first().click();

  const dialog = page.locator('dialog.video-modal');
  await expect(dialog).toBeVisible();

  // iframe src が youtube.com/embed/ を含む
  const iframe = dialog.locator('iframe');
  await expect(iframe).toHaveAttribute('src', /youtube\.com\/embed\//);
});

test('モーダルの閉じるボタンでモーダルが閉じる', async ({ page }) => {
  await randomDelay(3_000, 8_000);
  await page.goto('/videos', { waitUntil: 'domcontentloaded' });

  await page.locator('.video-card').first().click();

  const dialog = page.locator('dialog.video-modal');
  await expect(dialog).toBeVisible();

  await page.locator('.video-modal-close').click();
  await expect(dialog).not.toBeVisible();
});

test('YouTubeで見るリンクが正しい URL を持つ', async ({ page }) => {
  await randomDelay(3_000, 8_000);
  await page.goto('/videos', { waitUntil: 'domcontentloaded' });

  await page.locator('.video-card').first().click();

  const dialog = page.locator('dialog.video-modal');
  await expect(dialog).toBeVisible();

  // "YouTubeで見る" リンクが youtube.com/watch?v= を含む
  const ytLink = dialog.locator('a.video-modal-yt-link');
  await expect(ytLink).toHaveAttribute('href', /youtube\.com\/watch\?v=/);
});
