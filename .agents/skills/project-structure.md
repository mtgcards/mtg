# Skill: project-structure

プロジェクトのディレクトリ構造と主要ファイルの説明。

## ルート構造

```
├── src/                    # メインソースコード
│   ├── app/               # Next.js App Router
│   │   ├── [locale]/      # i18n ルーティング（ja/en/fr/de）
│   │   │   ├── [format]/  # カードフォーマット別ページ
│   │   │   ├── about/     # このサイトについて
│   │   │   ├── contact/   # お問い合わせ
│   │   │   ├── privacy/   # プライバシーポリシー
│   │   │   ├── videos/    # YouTube動画一覧
│   │   │   ├── price_movers/ # 値上がりカード
│   │   │   └── page.tsx   # トップページ（デフォルトフォーマット）
│   │   ├── api/           # API Routes
│   │   ├── layout.tsx     # ルートレイアウト
│   │   └── page.tsx       # リダイレクト用
│   ├── components/        # Reactコンポーネント
│   ├── lib/               # ユーティリティ・型定義
│   ├── i18n/              # next-intl 設定
│   └── styles/            # CSSファイル
├── messages/              # i18n翻訳ファイル（ja/en/fr/de.json）
├── scripts/               # データ取得スクリプト
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
| `scripts/shared.js` | 除外セット定義 |
| `wrangler.jsonc` | Cloudflare Workers設定 |

## データフロー

1. `scripts/fetch-cards.js` → Scryfall API → `src/generated/cards.json`
2. `scripts/fetch-price-movers.js` → JustTCG API → `src/generated/price-movers.json`
3. `scripts/fetch-videos.js` → YouTube API → `src/generated/videos.json`
4. Next.jsビルド → 静的HTML生成 → Cloudflare Workersへデプロイ
