# TODOアプリ開発記録

## プロジェクト概要
- プロジェクト名：TODOアプリ（Expo Go版）
- 目的：オフラインでも使用可能なTODOリストアプリの開発
- 開発期間：2024年12月21日
- 開発環境：Windows 10

## 技術スタック
- フレームワーク：Expo（React Native）
- 開発言語：TypeScript
- データストレージ：AsyncStorage
- 開発ツール：Visual Studio Code

## 開発経緯

### Phase 1: 環境構築
1. Node.jsのインストールと問題解決
   - 当初v22.12.0をインストール
   - npmコマンドの実行エラーが発生
   - v18.19.0に再インストールして解決
   ```bash
   # 確認コマンド
   node -v  # v18.19.0
   npm -v   # 10.2.3
   ```

2. プロジェクト初期化
   - 最小構成でのプロジェクト作成
   - `package.json`の基本設定
   ```json
   {
     "name": "todo-app-mini",
     "version": "1.0.0",
     "main": "node_modules/expo/AppEntry.js",
     "dependencies": {
       "expo": "~49.0.15",
       "react": "18.2.0",
       "react-native": "0.72.6"
     }
   }
   ```

### Phase 2: 基本機能の実装
1. UIコンポーネントの実装
   - タスク入力フォーム
   - タスクリスト表示
   - 追加ボタン

2. データ永続化の実装
   - AsyncStorageの導入
   - データの保存と読み込み機能
   - エラーハンドリング

3. タスク管理機能
   - タスクの追加
   - タスクの完了/未完了の切り替え
   - タスクの削除

## 実装済み機能
1. タスク管理の基本機能
   - [x] タスクの追加
   - [x] タスクの完了/未完了の切り替え
   - [x] タスクの削除
   - [x] データの永続化

2. UI/UX
   - [x] シンプルで直感的なインターフェース
   - [x] タスクの状態を視覚的に表示
   - [x] 削除時の確認ダイアログ

## 未解決の課題
1. [ ] 接続エラーの解決
   - Expo Goでの接続時にタイムアウトエラーが発生
   - `exp://192.168.10.108:8082`への接続が不安定

2. [ ] パフォーマンスの最適化
   - タスクリストが長くなった時の表示速度
   - AsyncStorageの効率的な使用

## 今後の実装予定
1. [ ] タスクの編集機能
2. [ ] タスクの並び替え機能
3. [ ] タスクの期限設定機能
4. [ ] カテゴリー分類機能
5. [ ] 検索機能

## 技術的な検討事項
1. データ構造
   ```typescript
   interface Task {
     id: string;
     text: string;
     completed: boolean;
   }
   ```

2. 状態管理
   - 現状はuseStateのみで管理
   - タスク数が増えた場合はContextAPIやReduxの検討が必要

3. オフライン対応
   - AsyncStorageを使用した完全なオフライン対応
   - データの整合性管理

## 参考資料・証跡
1. ソースコード
   - [App.tsx](./App.tsx)：メインアプリケーションコード
   - [package.json](./package.json)：依存関係の管理

2. 開発環境
   - Node.js v18.19.0
   - npm 10.2.3
   - Expo SDK 49.0.15

## 備考
- Expo Goを使用することで、無料での開発・テストが可能
- スタンドアロンアプリとしてビルドする場合は、Apple Developer Program（年間99ドル）が必要 