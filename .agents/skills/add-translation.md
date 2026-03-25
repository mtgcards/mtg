# Skill: add-translation

新しい翻訳キーを全言語の messages ファイルに追加する。

## 手順

1. `messages/ja.json` に日本語テキストを追加（基準ファイル）
2. 同じキーを `messages/en.json`, `messages/fr.json`, `messages/de.json` にも追加
3. 全ファイルで JSON 構造が一致していることを確認

## ファイル構成

```
messages/
  ja.json   ← 日本語（基準）
  en.json   ← 英語
  fr.json   ← フランス語
  de.json   ← ドイツ語
```

## 注意

- キー名は既存の命名規則（camelCase）に従う
- ネストされたオブジェクト構造を維持する
- 全言語でキーを欠落させると `next-intl` がエラーを出す
