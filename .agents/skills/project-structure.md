# Skill: project-structure

プロジェクトのディレクトリ構造と主要ファイルの説明。

## ルート構造

```
├── src/                    # メインソースコード
│   ├── pages/             # Astro ファイルベースルーティング
│   │   ├── [format].astro  # カードフォーマット別ページ
│   │   ├── index.astro    # トップページ
│   │   ├── about.astro    # このサイトについて
│   │   ├── contact.astro  # お問い合わせ
│   │   ├── privacy.astro  # プライバシーポリシー
│   │   ├── videos.astro   # YouTube動画一覧
│   │   ├── price_movers/  # 値上がりカード
│   │   ├── feed.xml.ts    # RSS
│   │   └── api/
│   │       └── exchange.ts # 為替レート API
│   ├── layouts/           # Astro レイアウト
│   ├── components/        # 共通 UI コンポーネント
│   │   ├── astro/         # Astro 専用コンポーネント
│   │   └── react/         # React Islands コンポーネント
│   ├── lib/               # ユーティリティ・型定義・i18n
│   └── styles/            # CSSファイル
├── messages/              # i18n翻訳 JSON（ja.json のみ）
├── scripts/               # データ取得スクリプト・OG画像生成
├── public/                # 静的アセット
├── .agents/               # AIエージェント用スキル
├── .claude/               # Claude Code設定
├── .gemini/               # Gemini CLI設定
├── .kimi/                 # Kimi Code設定
└── 設定ファイル類
```

## 重要ファイル

| ファイル | 用途 |
|---------|------|
| `src/lib/constants.ts` | サイトURL、フォーマット定義、閾値設定 |
| `src/lib/metadata.ts` | SEOメタデータ生成関数 |
| `src/lib/cards.ts` | カードデータ読み込み |
| `src/lib/i18n.ts` | 簡易 i18n ユーティリティ |
| `scripts/shared.js` | 除外セット定義 |
| `wrangler.toml` | Cloudflare Workers設定 |

## データフロー

1. `scripts/fetch-cards.js` → Scryfall API → `src/generated/cards.json`
2. `scripts/fetch-price-movers.js` → JustTCG API → `src/generated/price-movers.json`
3. `scripts/fetch-videos.js` → YouTube API → `src/generated/videos.json`
4. `astro build` → 静的 HTML 生成 + OG 画像生成
5. `wrangler deploy` → Cloudflare Workers へデプロイ
