# Electron白い画面問題 - トラブルシューティング

## 修正実施内容

### ✅ 完了済み修正
1. **Vite設定修正**
   - `base: './'` を追加して相対パス使用
   - 絶対パス (`/assets/`) → 相対パス (`./assets/`) に変更

2. **Electron設定修正**
   - `webSecurity: false` を追加
   - 不要なpreload.js参照を削除

3. **デバッグログ追加**
   - ファイルパス、読み込み状況の詳細ログ
   - DevToolsを常時開くよう設定

## 現在のログ状況（正常）
```
[ElectronMain] INFO: Loading UI from path { uiPath: '/Users/nobu/hackathon/secretary_agent/packages/web-ui/dist/index.html' }
[ElectronMain] INFO: Web contents finished loading
[ElectronMain] INFO: Main window shown
```

## 追加デバッグ手順

### 1. DevToolsでのコンソール確認
Electronアプリ起動時にDevToolsが開くので、以下を確認：
- Console タブでJavaScriptエラー
- Network タブでリソース読み込み状況
- Elements タブでDOMの状況

### 2. 手動検証
```bash
# Web版で正常動作確認
npm run start:web

# ビルドファイルの直接確認  
open packages/web-ui/dist/index.html
```

### 3. React初期化の確認
白い画面の場合、React componentが正しく初期化されていない可能性：
- `<div id="root"></div>` が存在するか
- React.render()が実行されているか
- CSS読み込みが成功しているか

## 現在の状況
Electronアプリケーションは技術的に正常起動しており、ファイル読み込みも成功しています。
白い画面が表示される場合は、React側の初期化問題の可能性があります。

## 次の確認ポイント
1. DevToolsのConsoleでエラーメッセージ確認
2. `npm run start:web` での動作比較
3. 必要に応じてReactコンポーネントの修正