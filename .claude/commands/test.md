# Test

Playwright E2E テストを実行する。

```bash
npm run test
```

初回は Chromium のインストールが自動実行される（`pretest` フック）。

ローカル開発サーバーに対して実行する場合は、先に `npm run dev` でサーバーを起動すること。
`BASE_URL` 環境変数でテスト対象 URL を変更できる（デフォルト: `http://localhost:4321`）。

外部 URL に対してテストする例：

```bash
BASE_URL=https://mtg.syowa.workers.dev npm run test
```
