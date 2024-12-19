# GitHub Pagesデプロイ作業記録

## 1. 初期設定と問題発生

### 1.1 初期環境
- リポジトリ: https://github.com/kurobe2240/todo-reminder
- ブランチ: main
- 開発環境: Windows 10
- Node.js: v16.x

### 1.2 最初のデプロイ試行
1. `package.json`の設定
```json
{
  "homepage": "https://kurobe2240.github.io/todo-reminder",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  }
}
```

2. 必要なパッケージのインストール
```bash
npm install gh-pages --save-dev
```

## 2. GitHub Actions設定の試行過程

### 2.1 最初のワークフロー設定
- ファイル: `.github/workflows/github-pages.yml`
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
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./build
```

### 2.2 発生した問題と対応
1. **問題**: `package.json`が見つからないエラー
   - エラーメッセージ: `npm ERR! enoent ENOENT: no such file or directory, open '/home/runner/work/todo-reminder/todo-reminder/package.json'`
   
2. **対応策**: ワーキングディレクトリの指定を追加
```yaml
defaults:
  run:
    working-directory: ./todo-reminder
```

### 2.3 ワークフロー改善の試行
1. Ubuntu バージョンの明示的指定
```yaml
runs-on: ubuntu-22.04
```

2. 並行実行の制御追加
```yaml
concurrency: ci-${{ github.ref }}
```

3. デバッグ情報の追加
```yaml
- name: List files
  run: |
    pwd
    ls -la
    cd todo-reminder
    ls -la
```

## 3. 手動デプロイの試行

### 3.1 gh-pagesブランチの作成
```bash
cd todo-reminder
git checkout -b gh-pages
git add build -f
git commit -m "Initial gh-pages commit"
git push origin gh-pages --force
```

### 3.2 Personal Access Token (PAT) の設定
1. GitHubでPATを生成
   - 必要な権限:
     - repo（全て）
     - workflow
     - admin:repo_hook

2. リモートURLの更新
```bash
git remote set-url origin https://<token>@github.com/kurobe2240/todo-reminder.git
```

## 4. 最終的なワークフロー設定

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
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '16'
      - name: Install
        working-directory: ./todo-reminder
        run: npm install
      - name: Build
        working-directory: ./todo-reminder
        run: CI=false npm run build
      - name: Deploy
        uses: JamesIves/github-pages-deploy-action@v4
        with:
          folder: todo-reminder/build
          branch: gh-pages
          token: ${{ secrets.GITHUB_TOKEN }}
```

## 5. デプロイ後の設定手順

1. GitHubリポジトリの設定
   - Settings → Pages
   - Source: "Deploy from a branch"
   - Branch: "gh-pages"
   - Folder: "/(root)"

2. デプロイURL
   - https://kurobe2240.github.io/todo-reminder

## 6. 発生した問題と解決策のまとめ

1. **ワーキングディレクトリの問題**
   - 症状: `package.json`が見つからない
   - 解決: `working-directory`の指定追加

2. **GitHub Actions権限の問題**
   - 症状: デプロイ失敗
   - 解決: `permissions: contents: write`の追加

3. **ビルドエラーの問題**
   - 症状: CI環境でのビルド失敗
   - 解決: `CI=false`フラグの追加

4. **gh-pagesブランチの問題**
   - 症状: ブランチが作成されない
   - 解決: 手動でのブランチ作成とプッシュ

## 7. 今後の改善点

1. **CI/CD最適化**
   - キャッシュの活用
   - ビルド時間の短縮
   - テスト自動化の追加

2. **セキュリティ強化**
   - 環境変数の適切な管理
   - セキュリティスキャンの追加

3. **監視とログ**
   - デプロイ状態の監視
   - エラーログの集中管理 