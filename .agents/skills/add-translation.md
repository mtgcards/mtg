# Skill: add-translation

新しい翻訳キーを `messages/ja.json` に追加する。

## 手順

1. `messages/ja.json` に日本語テキストを追加
2. `src/lib/i18n.ts` の `t()` 関数が対応していることを確認（ドット記法でネストされたキーを自動解決）

## ファイル構成

```
messages/
  ja.json   ← 日本語（唯一の翻訳ファイル）
```

## 使用例

```json
// messages/ja.json
{
  "mySection": {
    "newKey": "新しいテキスト"
  }
}
```

```tsx
import { t } from '@/lib/i18n';

<p>{t('mySection.newKey')}</p>
```

## 注意

- キー名は既存の命名規則（camelCase）に従う
- ネストされたオブジェクト構造を維持する
- 存在しないキーを `t()` に渡すと、コンソールに警告が出てキー名がそのまま表示される
