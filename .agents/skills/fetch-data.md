# Skill: fetch-data

外部 API からカード・価格・動画データを取得して `src/generated/` に保存する。

## 手順

1. 環境変数が設定されているか確認（`JUSTTCG_API_KEY`, `YOUTUBE_API_KEY`）
2. 各スクリプトを個別またはまとめて実行：

```bash
# 全データをまとめて取得（prebuild 経由）
SKIP_PREBUILD=false node scripts/prebuild.js

# 個別に取得
node scripts/fetch-cards.js
node scripts/fetch-price-movers.js
node scripts/fetch-videos.js
```

## 出力ファイル

| スクリプト | API | 出力 |
|---|---|---|
| `fetch-cards.js` | Scryfall | `src/generated/cards.json` |
| `fetch-price-movers.js` | JustTCG | `src/generated/price-movers.json` |
| `fetch-videos.js` | YouTube | `src/generated/videos.json` |

## 注意

- `src/generated/` は `.gitignore` に含まれるため git 管理外
- Scryfall API はレート制限があるため連続呼び出しに注意
