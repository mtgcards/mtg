# Skill: troubleshooting

よくある問題とその解決方法。

## ビルドエラー

### `MISSING_MESSAGE` エラー

**症状**: `privacy.description (ja)` などのエラー

**原因**: i18n翻訳キーが不足

**解決**: 
```bash
# messages/ja.json, en.json, fr.json, de.json に同じキーを追加
# add-translation スキルを参照
```

### `Failed to compile` - TypeScriptエラー

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
- CORSポリシー（本番環境）

**解決**:
- 開発時: ネットワーク接続を確認、ページリロード
- 本番時: `/api/exchange` API Route経由で取得しているか確認

### カードキー重複エラー

**症状**: `Encountered two children with the same key`

**原因**: 同じ名前・セットのカードが複数存在

**解決**: 
- `SetSection.tsx` の key に `imageUrl` を含める
- `${card.name}-${card.set}-${card.imageUrl ?? ''}`

## デプロイ問題

### Cloudflare Workersデプロイ失敗

**症状**: `wrangler deploy` 失敗

**確認事項**:
1. 環境変数が設定されているか
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
2. `npm run build` が成功しているか
3. `.open-next/` が生成されているか

### APIデータ取得失敗

**症状**: 値上がりカードや動画が表示されない

**原因**: APIキー未設定または期限切れ

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
rm -rf .next .open-next src/generated
npm run build
```
