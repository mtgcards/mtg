# Build

プリビルド（データ取得）+ Next.js ビルドを実行する。

```bash
npm run build
```

ビルド前に `scripts/prebuild.js` が自動実行され、以下の3スクリプトが順に走る：

1. `scripts/fetch-cards.js` — Scryfall API からカードデータ取得 → `src/generated/cards.json`
2. `scripts/fetch-price-movers.js` — JustTCG API から価格データ取得 → `src/generated/price-movers.json`
3. `scripts/fetch-videos.js` — YouTube API から動画データ取得 → `src/generated/videos.json`

API を呼ばずにキャッシュ済みデータでビルドしたい場合は `SKIP_PREBUILD=true npm run build`。
