import { test, expect } from '@playwright/test';

/**
 * 各タブに特定のカードが表示されているかを確認するテスト。
 *
 * 前提: `npm run build` 済みの状態で `next start` が起動している
 * (playwright.config.ts の webServer 設定で自動起動)
 */

const CARD_FIXTURES = [
  {
    tab: '1995〜2003',
    url: '/',
    setName: 'Prophecy',
    cardName: 'Rhystic Study',
  },
  {
    tab: '2004〜2014',
    url: '/y2004_2014',
    setName: 'Magic 2011',
    cardName: 'Pyretic Ritual',
  },
  {
    tab: '2015〜2020',
    url: '/y2015_2020',
    setName: 'War of the Spark',
    cardName: 'Narset, Parter of Veils',
  },
  {
    tab: '2021〜2022',
    url: '/y2021_2022',
    setName: 'Jumpstart 2022',
    cardName: 'Spellstutter Sprite',
  },
  {
    tab: '2023〜2025',
    url: '/y2023_2025',
    setName: 'Fallout',
    cardName: 'Nuka-Cola Vending Machine',
  },
  {
    tab: 'Basic Land',
    url: '/basic_land',
    setName: 'Asia Pacific Land Program',
    cardName: 'Plains',
  },
  {
    tab: 'Token',
    url: '/token',
    setName: 'Dominaria Tokens',
    cardName: 'Teferi, Hero of Dominaria Emblem',
  },
  {
    tab: 'Foil',
    url: '/foil',
    setName: 'Mercadian Masques',
    cardName: 'Brainstorm',
  },
] as const;

for (const { tab, url, setName, cardName } of CARD_FIXTURES) {
  test(`[${tab}] ${setName} に ${cardName} が表示される`, async ({ page }) => {
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    // setName を含む section を特定する
    // h2.set-title のテキストは "{setName} ({year}年)" の形式
    const section = page.locator('section.set-section').filter({
      has: page.locator('h2.set-title', { hasText: setName }),
    });

    // セクションが DOM に存在することを確認
    await expect(section.first()).toBeAttached();

    // そのセクション内にカード名が DOM に存在することを確認
    const card = section.first().locator('h3.card-name', { hasText: cardName }).first();
    await expect(card).toBeAttached();

    // スクロールしてから視覚的な表示も確認
    await card.scrollIntoViewIfNeeded();
    await expect(card).toBeVisible();
  });
}
