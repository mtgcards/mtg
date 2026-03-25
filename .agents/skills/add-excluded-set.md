# Skill: add-excluded-set

カード一覧から除外するセットを追加・管理する。

## 手順

1. `scripts/shared.js` を開く
2. `EXCLUDED_SETS` 配列に除外するセットのコード（Scryfall set code）または名前を追加

```js
// scripts/shared.js
const EXCLUDED_SETS = [
  // 既存エントリ...
  "new_set_code",  // ← ここに追加
];
```

## 除外ルール（現在の方針）

- Alpha / Beta / Unlimited などの旧版レギュラー
- Summer Magic / Edgar など非流通品
- Planechase / Archenemy 系（ゲームコンポーネント扱い）
- `Duel Decks:` で始まるセット（全て）
- Secret Lair / Promos 系

## 確認

追加後は `npm run build` でデータ取得からビルドまで通して動作確認する。
