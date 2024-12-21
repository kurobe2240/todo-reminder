# TODOリマインダーアプリ開発ログ

## プロジェクト概要

React + TypeScriptを使用したPWA対応のTODOリマインダーアプリケーション。
GitHub Pagesでホスティングし、オフライン対応とプッシュ通知機能を実装。

## 主な機能

- タスクの追加・削除・完了管理
- リマインド通知（時間指定、曜日指定）
- タイマー機能
- ダークモード対応
- PWA対応
- オフライン動作
- コードロック機能（デフォルト: 2240）

## 技術スタック

- フロントエンド
  - React 18.2.0
  - TypeScript 4.9.5
  - Material-UI 5.15.1
  - Framer Motion 10.16.16

- PWA関連
  - Service Worker
  - Web Push API
  - Cache API

## 実装の経緯

### 1. 基本機能の実装

1. プロジェクトの初期設定
   - Create React Appでプロジェクト作成
   - TypeScript設定
   - Material-UIの導入

2. コアコンポーネントの実装
   - TaskForm: タスク入力フォーム
   - TaskList: タスク一覧表示
   - TaskTimer: タイマー機能

### 2. PWA対応

1. Service Workerの実装
   ```javascript
   // public/service-worker.js
   const CACHE_NAME = 'todo-app-v1';
   const urlsToCache = [
     '/todo-reminder/',
     '/todo-reminder/index.html',
     // ...その他のリソース
   ];
   ```

2. Manifestファイルの設定
   ```json
   {
     "name": "TODOリマインダー",
     "short_name": "TODO",
     "start_url": "/todo-reminder/",
     // ...その他の設定
   }
   ```

### 3. 通知機能の実装

1. NotificationServiceの作成
   - プッシュ通知の実装
   - バックグラウンド通知対応
   - 通知音の追加

2. VAPIDキーの生成と設定
   ```env
   REACT_APP_VAPID_PUBLIC_KEY=BOLx3DDcPT2nD3uOIGo4FmxCMeaVx_brU-jfzvnD1vuU1olY2OobWQ4tltDAtquTLAAzhnBl7whUfVtNFcOx5hA
   REACT_APP_VAPID_PRIVATE_KEY=Uk5Q8n0j3e0R816Y4Ax44XMTEX7VyiX1zS7OpmQVu7o
   ```

### 4. GitHub Pages対応

1. デプロイ設定
   ```json
   {
     "homepage": "https://kurobe2240.github.io/todo-reminder",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d build"
     }
   }
   ```

2. ルーティング対応
   - 404.htmlの追加
   - パス設定の調整

## 現在の課題

1. GitHub Pages表示の問題
   - 404エラーの発生
   - パス設定の調整が必要

2. 通知機能の改善
   - iOSでのバックグラウンド通知制限
   - バッテリー最適化による通知の遅延

3. パフォーマンス最適化
   - キャッシュ戦略の改善
   - メモリ使用量の最適化

## 今後の作業リスト

1. 緊急対応
   - [ ] GitHub Pagesの404エラー解決
   - [ ] Service Workerのパス設定修正

2. 機能改善
   - [ ] 通知の信頼性向上
   - [ ] オフライン時の動作改善
   - [ ] バッテリー消費の最適化

3. 新機能追加
   - [ ] タスクのカテゴリ管理
   - [ ] タスクの優先度設定
   - [ ] データのバックアップ/リストア機能

## 参考資料

1. コードリポジトリ
   - [GitHub Pages](https://kurobe2240.github.io/todo-reminder/)
   - [ソースコード](https://github.com/kurobe2240/todo-reminder)

2. 技術ドキュメント
   - [PWA Documentation](https://web.dev/progressive-web-apps/)
   - [Web Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
   - [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

## トラブルシューティング履歴

### 2023-12-XX

1. 問題: GitHub Pagesで画面が真っ黒になる
   - 原因: パス設定の不整合
   - 対応: 
     - package.jsonのhomepage設定修正
     - Service Workerのパス調整
     - manifestファイルの更新

2. 問題: 通知が届かない
   - 原因: Service Workerの登録パスが不正
   - 対応:
     - 登録パスを/todo-reminder/に修正
     - VAPIDキーの再設定