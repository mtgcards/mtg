# Skill: coding-guidelines

このプロジェクトのコーディング規約とベストプラクティス。

## 言語・フレームワーク

- **Astro**: ファイルベースルーティング、`getStaticPaths()` で SSG
- **React**: Islands として `client:load` / `client:visible` で部分的に使用
- **TypeScript**: 厳格な型付け
- **i18n**: `src/lib/i18n.ts` の自前ユーティリティ（日本語のみ）

## ファイル命名規則

- コンポーネント: `PascalCase.tsx`（例: `CardGrid.tsx`）
- Astro コンポーネント: `PascalCase.astro`（例: `BaseLayout.astro`）
- ユーティリティ: `camelCase.ts`（例: `metadata.ts`）
- スタイル: `kebab-case.css`（例: `card-grid.css`）

## インポート順序

```typescript
// 1. 外部ライブラリ
import { useState } from 'react';

// 2. 内部モジュール（@/エイリアス）
import { SITE_URL } from '@/lib/constants';
import { buildFormatMetadata } from '@/lib/metadata';

// 3. コンポーネント
import CardGrid from '@/components/react/CardGrid';
```

## i18n 対応

- すべてのユーザー表示テキストは `messages/ja.json` に定義
- コンポーネント内では `t('key.subKey')` を使用
- 新しいキー追加時は `messages/ja.json` のみ編集すればよい

## メタデータ

- 各 Astro ページで `BaseLayout` に `title`, `description`, `canonical`, `ogImage` を渡す
- `src/lib/metadata.ts` のヘルパー関数を使用（必要に応じて）
- canonical URL と OG タグを正しく設定

## エラーハンドリング

- API 呼び出しは try-catch で囲む
- デフォルト値を提供（為替レートなど）
- ユーザーフレンドリーなエラーメッセージ

## パフォーマンス

- 画像は `unoptimized` 設定（Cloudflare Workers では画像最適化不可）
- クライアントフェッチは適切にキャッシュ
- 不要な Islands 化を避ける（必要なコンポーネントのみ `client:load`）
