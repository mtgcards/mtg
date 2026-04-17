# Deploy

Cloudflare Workers へビルド＆デプロイする。

```bash
npm run deploy
```

内部で `astro build && wrangler deploy` を実行。
事前に `npm run build` でデータ取得 + Astro ビルドを完了させておくこと。

フルフローでデプロイする場合：

```bash
npm run build && npm run deploy
```

必要な環境変数：
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
