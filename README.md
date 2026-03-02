# 昭和MTG 高額コモン&アンコモン貴重品室

**公開URL: https://mtg.syowa.workers.dev/**

Scryfall API を使って MTG のコモン・アンコモン・基本土地・トークン・FOIL カードの中から高値のものを年代別・セット別に一覧表示する Web アプリ。

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
| `JUSTTCG_API_KEY` | JustTCG API キー（値上がりカードデータ取得） |
| `YOUTUBE_API_KEY` | YouTube Data API キー（動画データ取得） |
| `CLOUDFLARE_API_TOKEN` | Cloudflare Workers デプロイ用 |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare アカウント ID |

### GitHub Actions ワークフロー

| ワークフロー | トリガー | 動作 |
|---|---|---|
| `scheduled-build.yml` | 毎日 JST 0:00 / 手動 | 3API からデータ取得 → キャッシュ保存 → ビルド・デプロイ |
| `deploy-on-push.yml` | main への push / 手動 | キャッシュ復元（API呼び出しなし）→ ビルド・デプロイ |

手動実行時に `run_prebuild` を ON にすると、`deploy-on-push.yml` でも API からデータを再取得してデプロイできます。

## 使用技術・データソース

- [Next.js 16](https://nextjs.org/)（App Router）+ React 19 + TypeScript
- [@opennextjs/cloudflare](https://opennext.js.org/cloudflare) — Cloudflare Workers へのデプロイ
- [Scryfall API](https://scryfall.com/docs/api) — カードデータ・画像・価格情報
- [JustTCG API](https://justtcg.com/) — 値上がりカード価格データ
- [YouTube Data API](https://developers.google.com/youtube/v3) — YouTube 動画データ
- [Frankfurter API](https://www.frankfurter.app/) — USD/JPY/EUR 為替レート
- [Formspree](https://formspree.io/) — お問い合わせフォーム送信処理
- [Cloudflare Web Analytics](https://www.cloudflare.com/web-analytics/) — Cookie 不使用のアクセス解析
