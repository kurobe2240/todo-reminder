# Todo Reminder App

タスク管理とリマインダー機能付きTODOアプリケーション

## プロジェクト概要

React + TypeScriptを使用したPWA（Progressive Web App）として実装されたTODOアプリケーション。
タスク管理機能に加えて、リマインダー通知機能を備えています。

## 実装機能

- タスクの追加・編集・削除
- タスクの優先度設定
- リマインダー時間の設定
- プッシュ通知によるリマインダー
- サウンド通知
- タスクの完了管理
- ローカルストレージによるデータ永続化
- PWA対応（スマートフォンのホーム画面に追加可能）

## 技術スタック

- React 18.2.0
- TypeScript 4.9.5
- Firebase（プッシュ通知用）
- Service Worker（バックグラウンド通知用）
- GitHub Pages（ホスティング）

## デプロイ手順と記録

### GitHub Pagesへのデプロイ試行記録

1. **初期デプロイ設定**
   - `gh-pages`パッケージをインストール
   ```bash
   npm install gh-pages --save-dev
   ```
   - `package.json`にデプロイ設定を追加
   ```json
   {
     "homepage": "https://kurobe2240.github.io/todo-reminder",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d build"
     }
   }
   ```

2. **GitHub Actions設定の試行**
   - 最初の試み：基本的なデプロイワークフロー
   ```yaml
   name: Deploy to GitHub Pages
   on:
     push:
       branches: [ main ]
     workflow_dispatch:
   permissions:
     contents: write
   jobs:
     build-and-deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
           with:
             node-version: '16'
         - name: Install Dependencies
           run: npm install
         - name: Build
           run: npm run build
         - name: Deploy
           uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: \${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./build
   ```

3. **デプロイ問題の解決過程**
   - 問題点：`package.json`が見つからないエラー
   - 解決策：ワーキングディレクトリの指定を追加
   ```yaml
   defaults:
     run:
       working-directory: ./todo-reminder
   ```

4. **最終的なワークフロー設定**
   ```yaml
   name: Deploy to GitHub Pages
   on:
     push:
       branches: [ main ]
     workflow_dispatch:
   permissions:
     contents: write
   jobs:
     deploy:
       runs-on: ubuntu-22.04
       concurrency: ci-\${{ github.ref }}
       steps:
         - name: Checkout
           uses: actions/checkout@v3
         - name: Setup Node
           uses: actions/setup-node@v3
           with:
             node-version: '16'
         - name: Install
           run: |
             cd todo-reminder
             npm install
         - name: Build
           run: |
             cd todo-reminder
             npm run build
         - name: Deploy
           uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: \${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./todo-reminder/build
   ```

5. **手動デプロイ手順**
   ```bash
   # gh-pagesブランチの作成とプッシュ
   cd todo-reminder
   npm run build
   git checkout -b gh-pages
   git add build -f
   git commit -m "Initial gh-pages commit"
   git push origin gh-pages --force
   ```

### デプロイ後の設定

1. GitHubリポジトリの設定
   - Settings → Pages
   - Source: "Deploy from a branch"を選択
   - Branch: "gh-pages"を選択
   - Folder: "/(root)"を選択

2. アクセスURL
   - https://kurobe2240.github.io/todo-reminder

## 開発環境

- Node.js 16.x
- npm 8.x
- Windows 10
- Visual Studio Code

## ローカル開発環境のセットアップ

```bash
# リポジトリのクローン
git clone https://github.com/kurobe2240/todo-reminder.git

# 依存パッケージのインストール
cd todo-reminder
npm install

# 開発サーバーの起動
npm start
```

## 注意事項

- プッシュ通知を使用するには、HTTPSが必要です
- ブラウザの通知許可が必要です
- Service Workerの登録が必要です
