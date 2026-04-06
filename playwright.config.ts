import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.BASE_URL || 'http://localhost:3000';

export default defineConfig({
  testDir: './tests',
  // タイムアウトを短縮（各テスト60秒以内で完了すべき）
  timeout: 60_000,
  // 並列実行設定: CI環境ではworkersを増やして高速化
  workers: process.env.CI ? 4 : undefined,
  // テスト全体のタイムアウト
  globalTimeout: 10 * 60 * 1000, // 10分
  use: {
    baseURL,
    // 画像読み込みを無効化してページ読み込みを高速化
    contextOptions: {
      reducedMotion: 'reduce',
    },
    // アクションのタイムアウト
    actionTimeout: 10_000,
    // ナビゲーションのタイムアウト
    navigationTimeout: 30_000,
  },
  reporter: [['html', { outputFolder: 'playwright-report', open: 'never' }]],
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // ブラウザ起動時の最適化
        launchOptions: {
          args: [
            '--disable-images',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--no-sandbox',
            '--disable-setuid-sandbox',
          ],
        },
      },
    },
  ],
  // BASE_URL が外部URLの場合は webServer を起動しない
  ...(!process.env.BASE_URL && {
    webServer: {
      command: 'npm run build && npm run start',
      url: 'http://localhost:3000',
      reuseExistingServer: true,
      timeout: 120_000,
    },
  }),
});
