# 昭和MTG 高額コモン&アンコモン貴重品室

Scryfall API を使って MTG のコモン・アンコモン・基本土地・トークン・FOIL カードの中から高値のものを年代別・セット別に一覧表示する Web アプリ。

## 機能

- 年代別タブでカードを絞り込み（9タブ）
- エキスパンション別にセクション分けして表示（セットシンボル付き）
- カード画像・価格を表示
- 価格閾値フィルター（コモン・アンコモン別に調整可能）
- 通貨切替（USD / JPY / EUR）— Frankfurter API でリアルタイム換算
- ショップリンク切替（晴れる屋 / Card Kingdom / TCGplayer）
- セクションナビゲーション（エキスパンションシンボル付き）
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

以下のセットは結果から除外しています。

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
# カードデータ取得 + Next.js ビルド
npm run build

# Cloudflare Workers へデプロイ
npm run deploy
```

`prebuild` で `scripts/fetch-cards.js` が Scryfall API からカードデータを取得し、`src/generated/cards.json` を生成します。

### 環境変数

| 変数名 | 説明 |
|--------|------|
| `NEXT_PUBLIC_SITE_URL` | 本番サイトの URL（OG タグ・構造化データに使用） |
| `CLOUDFLARE_API_TOKEN` | Cloudflare Workers デプロイ用 |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare アカウント ID |

### 定期ビルド

GitHub Actions（`.github/workflows/scheduled-build.yml`）で毎日自動ビルド・デプロイを実行し、カードデータ・為替レートを最新に保ちます。

## 使用技術・データソース

- [Next.js 16](https://nextjs.org/)（App Router）+ React 19 + TypeScript
- [@opennextjs/cloudflare](https://opennext.js.org/cloudflare) — Cloudflare Workers へのデプロイ
- [Scryfall API](https://scryfall.com/docs/api) — カードデータ・画像・価格情報
- [Frankfurter API](https://www.frankfurter.app/) — USD/JPY/EUR 為替レート
- [Formspree](https://formspree.io/) — お問い合わせフォーム送信処理
- [Cloudflare Web Analytics](https://www.cloudflare.com/web-analytics/) — Cookie 不使用のアクセス解析
