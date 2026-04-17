# Skill: troubleshooting

よくある問題とその解決方法。

## ビルドエラー

### `[i18n] Missing translation key: xxx`

**症状**: コンソールに警告が出て、画面にキー名がそのまま表示される

**原因**: `messages/ja.json` に翻訳キーが不足

**解決**: 
```bash
# messages/ja.json に不足しているキーを追加
# add-translation スキルを参照
```

### `Failed to compile` - TypeScript エラー

**症状**: 型エラーでビルド失敗

**解決**:
```bash
# 型チェックのみ実行
npx tsc --noEmit

# 自動修正を試行
npx tsc --noEmit --skipLibCheck
```

## 開発時の問題

### 為替レート取得失敗

**症状**: `Failed to fetch` (Frankfurter API)

**原因**: 
- ネットワーク接続問題
- API Route (`/api/exchange`) へのアクセス失敗

**解決**:
- 開発時: ネットワーク接続を確認、ページリロード
- 本番時: API Route が正常に動作しているか確認

### カードキー重複エラー

**症状**: `Encountered two children with the same key`

**原因**: 同じ名前・セットのカードが複数存在

**解決**: 
- `SetSection.tsx` の key に `imageUrl` を含める
- `${card.name}-${card.set}-${card.imageUrl ?? ''}`

## デプロイ問題

### Cloudflare Workers デプロイ失敗

**症状**: `wrangler deploy` 失敗

**確認事項**:
1. 環境変数が設定されているか
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
2. `npm run build` が成功しているか
3. `dist/_worker.js/index.js` が生成されているか

### API データ取得失敗

**症状**: 値上がりカードや動画が表示されない

**原因**: API キー未設定または期限切れ

**解決**:
```bash
# 環境変数を確認
echo $JUSTTCG_API_KEY
echo $YOUTUBE_API_KEY

# .env ファイルを確認
cat .env
```

## キャッシュ問題

### 古いデータが表示される

**解決**:
```bash
# クリーンビルド
rm -rf dist src/generated
npm run build
```
