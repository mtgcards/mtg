# Architecture — 昭和MTG 高額コモン&アンコモン貴重品室

## 概要

Next.js (App Router) + TypeScript で構築し、Cloudflare Workers にデプロイする多言語 MTG カード価格サービス。
ビルド時に外部 API からデータ取得し、静的 JSON として埋め込む。ランタイム API 呼び出しなし。

## 技術スタック

| 層 | 技術 |
|---|---|
| フレームワーク | Next.js 16 (App Router), React 19, TypeScript 5 |
| i18n | next-intl（ja / en / fr / de） |
| デプロイ | Cloudflare Workers via `@opennextjs/cloudflare` |
| テスト | Playwright (E2E, Chromium) |
| Lint | ESLint 9 |

## ディレクトリ構成

```
src/
  app/
    [locale]/           ← i18n ルーティング（next-intl）
      [format]/         ← 年代別・種別フォーマットページ
      price_movers/
        [period]/       ← 24h / 7d / 30d / 90d
      videos/
      about/
      contact/
      privacy/
  components/           ← 共通 UI コンポーネント
  lib/                  ← 型・ユーティリティ・定数
  i18n/                 ← next-intl 設定
  styles/               ← グローバル・ページ別 CSS
messages/               ← i18n 翻訳 JSON（ja/en/fr/de）
scripts/                ← ビルド前データ取得スクリプト
public/                 ← 静的アセット
```

## データフロー

```
npm run build
  └─ prebuild（scripts/prebuild.js）
       ├─ fetch-cards.js      → Scryfall API  → src/generated/cards.json
       ├─ fetch-price-movers.js → JustTCG API → src/generated/price-movers.json
       └─ fetch-videos.js     → YouTube API   → src/generated/videos.json
  └─ next build（生成 JSON をバンドル）
  └─ opennextjs-cloudflare build → .open-next/
  └─ wrangler deploy → Cloudflare Workers
```

`SKIP_PREBUILD=true` でデータ取得をスキップ（GitHub Actions キャッシュ利用時）。

## 主要コンポーネント

| ファイル | 役割 |
|---|---|
| `CardGrid.tsx` | カード一覧（閾値・通貨・ショップフィルター） |
| `CardItem.tsx` | カード1枚 UI（価格・ショップリンク付き） |
| `SetSection.tsx` | セット単位カードグループ |
| `PriceMoversGrid.tsx` | 値上がりカード一覧 |
| `VideoGrid.tsx` | YouTube 動画一覧（モーダル付き） |
| `TabBar.tsx` | 年代・種別タブナビゲーション |
| `ThresholdBar.tsx` | 価格閾値・通貨・ショップ切替 UI |

## URL 構造

```
/{locale}/                    ← カード一覧（デフォルト: y1995_2003）
/{locale}/{format}            ← 年代別・種別フォーマット
/{locale}/price_movers        ← 値上がりランキング（デフォルト: 24h）
/{locale}/price_movers/{period}
/{locale}/videos
/{locale}/about
/{locale}/contact
/{locale}/privacy
```

`{locale}` = `ja` | `en` | `fr` | `de`
`{format}` = `y1995_2003` | `y2004_2014` | `y2015_2020` | `y2021_2022` | `y2023_2025` | `y2026_` | `basic_land` | `token` | `foil`
`{period}` = `24h` | `7d` | `30d` | `90d`

## 外部 API・サービス

| サービス | 用途 |
|---|---|
| Scryfall API | カードデータ・画像・価格 |
| JustTCG API | 値上がりカード価格データ（**使用制限が厳しいためローカル開発では取得しない**。GitHub Actions の `scheduled-build.yml` のみで呼び出す） |
| YouTube Data API | MTG 動画一覧 |
| Frankfurter API | USD/JPY/EUR 為替レート（クライアント側取得） |
| Formspree | お問い合わせフォーム |
| Cloudflare Web Analytics | Cookie 不使用のアクセス解析 |

## 環境変数

| 変数 | 用途 |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | OG タグ・構造化データの本番 URL |
| `JUSTTCG_API_KEY` | JustTCG API 認証 |
| `YOUTUBE_API_KEY` | YouTube Data API 認証 |
| `CLOUDFLARE_API_TOKEN` | Cloudflare Workers デプロイ |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare アカウント識別 |

## GitHub Actions

| ワークフロー | トリガー | 動作 |
|---|---|---|
| `scheduled-build.yml` | 毎日 JST 0:00 / 手動 | API データ取得 → ビルド → デプロイ |
| `deploy-on-push.yml` | main push / 手動 | キャッシュ復元 → ビルド → デプロイ（API 省略可） |
| `playwright.yml` | push / PR | E2E テスト実行 |
| `post-price-movers.yml` | スケジュール | 価格データ外部サービスへ投稿 |
