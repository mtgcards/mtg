# 昭和MTG 高額コモン&アンコモン貴重品室

**公開URL: https://mtg.syowa.workers.dev/**

Scryfall API を使って MTG のコモン・アンコモン・基本土地・トークン・FOIL カードの中から高値のものを年代別・セット別に一覧表示する Web アプリ。日本語・英語・フランス語・ドイツ語の4言語に対応。

## 機能

- 年代別タブでカードを絞り込み（9タブ）
- エキスパンション別にセクション分けして表示（セットシンボル付き）
- カード画像・価格を表示
- 価格閾値フィルター（コモン・アンコモン別に調整可能）
- 通貨切替（USD / JPY / EUR）— Frankfurter API でリアルタイム換算
- ショップリンク切替（晴れる屋 / Card Kingdom / TCGplayer）
- セクションナビゲーション（エキスパンションシンボル付き）
- 値上がりカードランキング（24時間・1週間・1ヶ月・3ヶ月）— JustTCG API
- YouTube 動画一覧
- お問い合わせフォーム（Formspree）
- 多言語対応（ja / en / fr / de）— next-intl による i18n
- Cloudflare Web Analytics（Cookie 不使用）

## タブ一覧

| タブ | 対象 | デフォルト閾値（コモン / アンコモン） |
|------|------|--------------------------------------|
| 1995〜2003年 | コモン・アンコモン | $0.80 / $2.00 |
| 2004〜2014年 | コモン・アンコモン | $0.80 / $2.00 |
| 2015〜2020年 | コモン・アンコモン | $0.80 / $2.00 |
| 2021〜2022年 | コモン・アンコモン | $0.80 / $2.00 |
| 2023〜2025年 | コモン・アンコモン | $0.80 / $2.00 |
| 2026年〜     | コモン・アンコモン | $0.80 / $2.00 |
| Basic Land   | 基本土地全期間     | $2.50 |
| Token        | トークン全期間     | $2.50 |
| Foil         | FOIL コモン・アンコモン全期間 | $10.00 / $10.00 |

## その他ページ

| ページ | URL |
|--------|-----|
| 値上がりカード | `/{locale}/price_movers` / `/{locale}/price_movers/{period}` |
| YouTube動画 | `/{locale}/videos` |
| このサイトについて | `/{locale}/about` |
| お問い合わせ | `/{locale}/contact` |
| プライバシーポリシー | `/{locale}/privacy` |

## ルーティング構成

```
https://mtg.syowa.workers.dev/             ← デフォルトロケールへリダイレクト
https://mtg.syowa.workers.dev/{locale}/    ← 言語別トップ（1995〜2003）
https://mtg.syowa.workers.dev/{locale}/{format}  ← 言語別フォーマット
https://mtg.syowa.workers.dev/{locale}/price_movers
https://mtg.syowa.workers.dev/{locale}/price_movers/{period}
https://mtg.syowa.workers.dev/{locale}/videos
https://mtg.syowa.workers.dev/{locale}/about
https://mtg.syowa.workers.dev/{locale}/contact
https://mtg.syowa.workers.dev/{locale}/privacy
```

`{locale}` = `ja` / `en` / `fr` / `de`  
`{format}` = `y1995_2003`(default) / `y2004_2014` / `y2015_2020` / `y2021_2022` / `y2023_2025` / `y2026_` / `basic_land` / `token` / `foil`  
`{period}` = `24h` / `7d` / `30d` / `90d`

## 除外セット

以下のセットは結果から除外しています（`scripts/shared.js` で管理）。

- Alpha / Beta / Unlimited などの旧版レギュラー
- Summer Magic / Edgar、Foreign Black Border など非流通品
- Planechase / Archenemy 系（ゲームコンポーネント扱い）
- `Duel Decks:` で始まるセット（全て）
- `Duel Decks Anthology:` で始まるセット（全て）
- `Archenemy:` で始まるセット（全て）
- Secret Lair / Promos / Mystery Booster 2 など

## 開発

```bash
npm install
npm run dev
```

## ビルド・デプロイ

```bash
# カードデータ・価格データ・動画データ取得 + Next.js ビルド
npm run build

# Cloudflare Workers へデプロイ
npm run deploy
```

`prebuild`（`scripts/prebuild.js`）で以下の3スクリプトを順番に実行します。

| スクリプト | API | 出力ファイル |
|---|---|---|
| `scripts/fetch-cards.js` | Scryfall API | `src/generated/cards.json` |
| `scripts/fetch-price-movers.js` | JustTCG API | `src/generated/price-movers.json` |
| `scripts/fetch-videos.js` | YouTube Data API | `src/generated/videos.json` |

`SKIP_PREBUILD=true` を設定すると prebuild をスキップします（GitHub Actions での再実行防止に使用）。

### 環境変数

| 変数名 | 説明 |
|--------|------|
| `NEXT_PUBLIC_SITE_URL` | 本番サイトの URL（OG タグ・構造化データに使用） |
| `JUSTTCG_API_KEY` | JustTCG API キー（値上がりカードデータ取得）**※使用制限が厳しいためローカル開発では取得しない** |
| `YOUTUBE_API_KEY` | YouTube Data API キー（動画データ取得） |
| `CLOUDFLARE_API_TOKEN` | Cloudflare Workers デプロイ用 |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare アカウント ID |

### GitHub Actions ワークフロー

| ワークフロー | トリガー | 動作 |
|---|---|---|
| `scheduled-build.yml` | 毎日 JST 0:00 / 手動 | 3API からデータ取得 → キャッシュ保存 → ビルド・デプロイ |
| `deploy-on-push.yml` | main への push / 手動 | キャッシュ復元（API呼び出しなし）→ ビルド・デプロイ |
| `post-price-movers.yml` | 毎日 JST 20:00 / 手動 | キャッシュ復元 → 値上がりカードを X（Twitter）に投稿 |
| `playwright.yml` | 毎日 JST 7:00・17:00 / 手動 | 本番サイトに対して Playwright E2E テストを実行 |

手動実行時に `run_prebuild` を ON にすると、`deploy-on-push.yml` でも API からデータを再取得してデプロイできます。

## リファクタリングについて

### コード構成

```
src/
  app/
    [locale]/         ← i18nルーティング（next-intl）
      [format]/       ← 各フォーマットページ
      price_movers/
      videos/
      about/
      contact/
      privacy/
  components/         ← 共通 UI コンポーネント
  lib/                ← 型定義・ユーティリティ・定数
  i18n/               ← next-intl 設定・ナビゲーション
  styles/             ← ページ・コンポーネントの CSS
messages/             ← i18n 翻訳ファイル（ja / en / fr / de）
scripts/              ← プリビルド・データ取得スクリプト
public/               ← 静的アセット
```

### 主要コンポーネント

| ファイル | 役割 |
|---|---|
| `CardGrid.tsx` | アクティブなカード一覧（閾値フィルタ・通貨・ショップ切替） |
| `CardItem.tsx` | カード1枚のカードUI（値上がり・セット名表示にも対応） |
| `SetSection.tsx` | セット単位のカードグリッド |
| `PriceMoversGrid.tsx` | 値上がりカード一覧（CardItem 共通化） |
| `VideoGrid.tsx` | YouTube動画一覧（モーダルプレイヤー付き） |
| `TabBar.tsx` | タブナビゲーション |
| `ThresholdBar.tsx` | 価格閾値・通貨・ショップ選択 |

## 使用技術・データソース

- [Next.js](https://nextjs.org/)（App Router）+ React + TypeScript
- [next-intl](https://next-intl-docs.vercel.app/) — i18n（日英仏独 4言語）
- [@opennextjs/cloudflare](https://opennext.js.org/cloudflare) — Cloudflare Workers へのデプロイ
- [Scryfall API](https://scryfall.com/docs/api) — カードデータ・画像・価格情報
- [JustTCG API](https://justtcg.com/) — 値上がりカード価格データ
- [YouTube Data API](https://developers.google.com/youtube/v3) — YouTube 動画データ
- [Frankfurter API](https://www.frankfurter.app/) — USD/JPY/EUR 為替レート
- [Formspree](https://formspree.io/) — お問い合わせフォーム送信処理
- [Cloudflare Web Analytics](https://www.cloudflare.com/web-analytics/) — Cookie 不使用のアクセス解析
