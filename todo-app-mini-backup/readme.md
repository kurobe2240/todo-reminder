# TODOアプリケーション（React Native）

> **重要な注意事項**
> 
> このプロジェクトは、当初Expoベースで開発されていましたが、以下の理由により標準的なReact Nativeアプリケーション（Expo不使用）として再構築されています：
> 
> 1. Expoに依存しない柔軟な開発環境の構築
> 2. ネイティブモジュールの直接制御が可能
> 3. アプリケーションサイズの最適化
> 4. カスタムネイティブモジュールの追加が容易
> 5. AsyncStorageによる効率的なデータ永続化
> 
> データの永続化には@react-native-async-storage/async-storageを使用し、
> アプリケーションのパフォーマンスと信頼性を確保します。

# 現状の分析結果

## 現在のディレクトリ構造
```
todo-app-mini/
├── docs/
│   └── development_log.md
├── public/
│   └── index.html
├── src/
│   ├── App.css
│   ├── App.tsx
│   ├── index.css
│   └── index.tsx
├── node_modules/
├── package.json
├── tsconfig.json
└── yarn.lock
```

## 現在の技術スタック
- React Native: ^0.76.5
- React: ^19.0.0
- TypeScript: ^5.3.3
- @react-native-async-storage/async-storage: ^2.1.0
- 開発環境
  - @babel/core: ^7.23.6
  - @babel/preset-env: ^7.23.6
  - ESLint: ^9.17.0
  - @typescript-eslint/eslint-plugin: ^8.18.1
  - Jest: ^29.7.0
  - Prettier: ^3.1.1

## 現在の課題

### 1. プロジェクト構造の移行
- React Native CLI環境の構築が必要
- android/iosディレクトリの作成と設定
- Web向けファイル（public/, *.css）の削除

### 2. コンポーネントの移行
- App.tsxのReact Native対応
- スタイリングのStyleSheet API対応
- index.tsxの再構築

### 3. データ永続化の実装
- AsyncStorageの実装
- 既存のデータ構造の移行
- バックアップ機能の実装
  - AsyncStorageの全データをJSONファイルとしてエクスポート
  - 外部ストレージへの保存機能
  - バックアップファイルの自動バージョニング
- 復元機能の実装
  - バックアップファイルの選択機能
  - JSONデータの検証と型チェック
  - 段階的なデータ復元プロセス
  - 復元失敗時のロールバック機能

### 4. 開発環境の整備
- Android Studio / Xcodeの設定
- Metro bundlerの設定
- デバッグ環境の構築

### 5. データ管理機能の拡張
- バックアップ管理画面の実装
  - バックアップ一覧の表示
  - バックアップの作成日時表示
  - バックアップファイルの削除機能
- 自動バックアップ機能
  - 定期的なバックアップスケジュール設定
  - バックアップの保存期間設定
  - ストレージ容量の監視と管理
- データ検証機能
  - バックアップデータの整合性チェック
  - 破損データの検出と修復
  - マイグレーション処理の自動化