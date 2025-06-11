# コンポーネント別Issues一覧

## 概要
各パッケージの実装タスクをGitHub Issues形式でまとめたもの。
ラベル: `[パッケージ名]`, `priority:high/medium/low`, `type:feature/bug/chore`

---

## 1. packages/shared (基盤)

### Issue #1: 共通型定義の作成
- **Labels**: `shared`, `priority:high`, `type:feature`
- **Description**: アプリケーション全体で使用する型定義
- **Tasks**:
  - [ ] Email型定義
  - [ ] Task型定義
  - [ ] User設定型定義
  - [ ] API レスポンス型定義

### Issue #2: 共通ユーティリティ関数
- **Labels**: `shared`, `priority:medium`, `type:feature`
- **Description**: 各パッケージで使用する共通関数
- **Tasks**:
  - [ ] 日付フォーマット関数
  - [ ] エラーハンドリングユーティリティ
  - [ ] ログ出力ユーティリティ

---

## 2. packages/database

### Issue #3: SQLiteセットアップとスキーマ定義
- **Labels**: `database`, `priority:high`, `type:feature`
- **Depends on**: #1
- **Description**: データベース基盤の構築
- **Tasks**:
  - [ ] SQLite初期化
  - [ ] スキーマ定義（emails, tasks, settings）
  - [ ] マイグレーションシステム

### Issue #4: DAOレイヤー実装
- **Labels**: `database`, `priority:high`, `type:feature`
- **Depends on**: #3
- **Description**: データアクセス層の実装
- **Tasks**:
  - [ ] EmailDAO
  - [ ] TaskDAO
  - [ ] SettingsDAO
  - [ ] トランザクション管理

---

## 3. packages/email-service

### Issue #5: メールクライアント基盤
- **Labels**: `email-service`, `priority:high`, `type:feature`
- **Depends on**: #1
- **Description**: メール取得の基本機能
- **Tasks**:
  - [ ] IMAPクライアント実装
  - [ ] OAuth認証フロー
  - [ ] メールパーサー

### Issue #6: マルチプロバイダー対応
- **Labels**: `email-service`, `priority:medium`, `type:feature`
- **Depends on**: #5
- **Description**: Gmail、Outlook対応
- **Tasks**:
  - [ ] Gmail API統合
  - [ ] Outlook API統合
  - [ ] プロバイダー抽象化層

### Issue #7: メール監視サービス
- **Labels**: `email-service`, `priority:high`, `type:feature`
- **Depends on**: #5
- **Description**: 定期的なメール取得
- **Tasks**:
  - [ ] ポーリング実装
  - [ ] 新着メール検知
  - [ ] イベント発火

---

## 4. packages/ai-engine

### Issue #8: LLM API統合
- **Labels**: `ai-engine`, `priority:high`, `type:feature`
- **Depends on**: #1
- **Description**: AI APIクライアント実装
- **Tasks**:
  - [ ] OpenAI APIクライアント
  - [ ] Claude APIクライアント
  - [ ] APIキー管理

### Issue #9: プロンプトエンジニアリング
- **Labels**: `ai-engine`, `priority:high`, `type:feature`
- **Depends on**: #8
- **Description**: 各種プロンプトテンプレート
- **Tasks**:
  - [ ] メール解析プロンプト
  - [ ] タスク生成プロンプト
  - [ ] 優先度判定プロンプト
  - [ ] 返信案生成プロンプト

### Issue #10: レスポンス解析
- **Labels**: `ai-engine`, `priority:high`, `type:feature`
- **Depends on**: #8
- **Description**: AI応答の構造化
- **Tasks**:
  - [ ] JSONパーサー
  - [ ] エラーハンドリング
  - [ ] リトライロジック

---

## 5. packages/task-service

### Issue #11: タスク管理コア
- **Labels**: `task-service`, `priority:high`, `type:feature`
- **Depends on**: #1, #4
- **Description**: タスクの基本CRUD操作
- **Tasks**:
  - [ ] タスク作成・更新
  - [ ] タスクステータス管理
  - [ ] タスク検索

### Issue #12: タスク自動生成
- **Labels**: `task-service`, `priority:high`, `type:feature`
- **Depends on**: #11, #10
- **Description**: メールからのタスク生成
- **Tasks**:
  - [ ] タスク生成ロジック
  - [ ] タスク分割アルゴリズム
  - [ ] 関連付けロジック

### Issue #13: 優先度計算エンジン
- **Labels**: `task-service`, `priority:high`, `type:feature`
- **Depends on**: #11
- **Description**: 5段階優先度の自動計算
- **Tasks**:
  - [ ] 優先度算出アルゴリズム
  - [ ] 学習データ収集
  - [ ] フィードバック反映

---

## 6. packages/core

### Issue #14: ワークフローエンジン
- **Labels**: `core`, `priority:high`, `type:feature`
- **Depends on**: #7, #12
- **Description**: メール→タスクの自動フロー
- **Tasks**:
  - [ ] イベントバス実装
  - [ ] ワークフロー定義
  - [ ] エラーハンドリング

### Issue #15: 設定管理
- **Labels**: `core`, `priority:medium`, `type:feature`
- **Depends on**: #4
- **Description**: アプリケーション設定
- **Tasks**:
  - [ ] 設定スキーマ定義
  - [ ] 設定の永続化
  - [ ] デフォルト値管理

---

## 7. packages/web-ui

### Issue #16: UIコンポーネント基盤
- **Labels**: `web-ui`, `priority:high`, `type:feature`
- **Description**: React基本セットアップ
- **Tasks**:
  - [ ] React + TypeScript設定
  - [ ] UIライブラリ選定・設定
  - [ ] ルーティング設定
  - [ ] 状態管理（Zustand）

### Issue #17: ダッシュボード画面
- **Labels**: `web-ui`, `priority:high`, `type:feature`
- **Depends on**: #16
- **Description**: メイン画面の実装
- **Tasks**:
  - [ ] レイアウトコンポーネント
  - [ ] タスク一覧表示
  - [ ] メール要約表示
  - [ ] 統計情報表示

### Issue #18: タスク管理UI
- **Labels**: `web-ui`, `priority:high`, `type:feature`
- **Depends on**: #16
- **Description**: タスク操作画面
- **Tasks**:
  - [ ] タスク詳細モーダル
  - [ ] タスク編集フォーム
  - [ ] ドラッグ&ドロップ
  - [ ] フィルター・ソート

### Issue #19: 設定画面
- **Labels**: `web-ui`, `priority:medium`, `type:feature`
- **Depends on**: #16
- **Description**: 各種設定UI
- **Tasks**:
  - [ ] メールアカウント設定
  - [ ] AI設定
  - [ ] 通知設定
  - [ ] テーマ設定

---

## 8. packages/electron-main

### Issue #20: Electronアプリ基盤
- **Labels**: `electron-main`, `priority:high`, `type:feature`
- **Description**: Electronメインプロセス
- **Tasks**:
  - [ ] ウィンドウ管理
  - [ ] メニューバー
  - [ ] アプリケーション設定

### Issue #21: IPC通信層
- **Labels**: `electron-main`, `priority:high`, `type:feature`
- **Depends on**: #20
- **Description**: プロセス間通信
- **Tasks**:
  - [ ] IPCハンドラー定義
  - [ ] セキュリティ設定
  - [ ] エラーハンドリング

### Issue #22: システムトレイ統合
- **Labels**: `electron-main`, `priority:medium`, `type:feature`
- **Depends on**: #20
- **Description**: システムトレイ機能
- **Tasks**:
  - [ ] トレイアイコン
  - [ ] コンテキストメニュー
  - [ ] 通知機能
  - [ ] 自動起動設定

---

## 9. packages/mcp-servers（Phase 2）

### Issue #23: MCPサーバー基盤
- **Labels**: `mcp-servers`, `priority:low`, `type:feature`
- **Description**: MCP拡張の基盤
- **Tasks**:
  - [ ] MCPプロトコル実装
  - [ ] サーバー登録システム
  - [ ] 通信層

### Issue #24: カレンダー連携サーバー
- **Labels**: `mcp-servers`, `priority:low`, `type:feature`
- **Depends on**: #23
- **Description**: カレンダー統合
- **Tasks**:
  - [ ] Google Calendar API
  - [ ] Outlook Calendar API
  - [ ] イベント同期

---

## 実装順序（推奨）

### Sprint 1 (Day 1-3): 基盤構築
1. #1: 共通型定義
2. #3: SQLiteセットアップ
3. #4: DAOレイヤー
4. #16: UIコンポーネント基盤

### Sprint 2 (Day 4-6): コア機能
1. #5: メールクライアント基盤
2. #8: LLM API統合
3. #9: プロンプトエンジニアリング
4. #11: タスク管理コア

### Sprint 3 (Day 7-9): 統合
1. #12: タスク自動生成
2. #14: ワークフローエンジン
3. #17: ダッシュボード画面
4. #20: Electronアプリ基盤

### Sprint 4 (Day 10-12): 完成
1. #7: メール監視サービス
2. #13: 優先度計算エンジン
3. #18: タスク管理UI
4. #21: IPC通信層

### Sprint 5 (Day 13-14): テスト・改善
1. 統合テスト
2. パフォーマンス最適化
3. バグ修正
4. ドキュメント整備