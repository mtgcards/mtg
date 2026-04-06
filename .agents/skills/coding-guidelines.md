# Skill: coding-guidelines

このプロジェクトのコーディング規約とベストプラクティス。

## 言語・フレームワーク

- **Next.js**: App Router使用
- **React**: Server Components優先、必要に応じてClient Components
- **TypeScript**: 厳格な型付け
- **next-intl**: i18n対応

## ファイル命名規則

- コンポーネント: `PascalCase.tsx`（例: `CardGrid.tsx`）
- ユーティリティ: `camelCase.ts`（例: `metadata.ts`）
- スタイル: `kebab-case.css`（例: `card-grid.css`）

## インポート順序

```typescript
// 1. 外部ライブラリ
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

// 2. 内部モジュール（@/エイリアス）
import { SITE_URL } from '@/lib/constants';
import { buildFormatMetadata } from '@/lib/metadata';

// 3. コンポーネント
import CardPageLayout from '@/components/CardPageLayout';
```

## i18n対応

- すべてのユーザー表示テキストは `messages/*.json` に定義
- コンポーネント内では `useTranslations()` または `getTranslations()` を使用
- 新しいキー追加時は4言語すべてに追加（`add-translation` スキル参照）

## メタデータ

- 各ページで `generateMetadata` をエクスポート
- `src/lib/metadata.ts` のヘルパー関数を使用
- canonical URL と hreflang を正しく設定

## エラーハンドリング

- API呼び出しは try-catch で囲む
- デフォルト値を提供（為替レートなど）
- ユーザーフレンドリーなエラーメッセージ

## パフォーマンス

- 画像は Next.js Image コンポーネント使用
- クライアントフェッチは適切にキャッシュ
- 不要な再レンダリングを避ける
