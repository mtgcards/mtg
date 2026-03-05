import { test, expect } from '@playwright/test';

const randomDelay = (minMs: number, maxMs: number): Promise<void> =>
  new Promise(resolve =>
    setTimeout(resolve, Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs)
  );

const PERIODS = ['24h', '7d', '30d', '90d'] as const;

for (const period of PERIODS) {
  test(`[${period}] ページが表示されカードが1件以上存在する`, async ({ page }) => {
    await randomDelay(3_000, 15_000);
    await page.goto(`/ja/price_movers/${period}`, { waitUntil: 'domcontentloaded' });

    // ページタイトルが表示される
    await expect(page.locator('h1')).toBeVisible();

    // 「データなし」メッセージが表示されていないことを先に確認
    await expect(page.locator('p.end-message').filter({ hasText: /noResults|No results|データなし|該当なし/ })).not.toBeVisible();

    // .card-grid が存在する
    await expect(page.locator('.card-grid')).toBeVisible();

    // .set-card-grid 内にカードが1件以上存在する
    const cards = page.locator('.set-card-grid > *');
    const count = await cards.count();
    expect(count, `${period}: カードが0件です。4データが未取得の可能性があります`).toBeGreaterThan(0);

    // 期間タブが4つ表示される
    await expect(page.locator('.period-tab')).toHaveCount(4);

    // 対象期間のタブが active 状態になる
    await expect(page.locator(`.period-tab.active`)).toHaveText(new RegExp(period));

    // 末尾の「すべて表示」メッセージが出る
    await expect(page.locator('p.end-message').last()).toBeVisible();
  });
}
