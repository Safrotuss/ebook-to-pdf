# E-Book to PDF コンバーター
[English](README.md) | [한국어](docs/README.ko.md) | [中文](docs/README.zh.md)

E-Bookビューアから自動的にページをキャプチャしてPDFに変換するデスクトップアプリケーションです。

## 主な機能
- 画面領域の自動キャプチャ
- 自動ページめくり
- PDF変換
- キャプチャ速度調整
- リアルタイム進行状況表示
- マルチプラットフォーム対応（macOS、Windows）

## 技術スタック
- Electron
- React
- TypeScript
- Sharp（画像処理）
- PDFKit（PDF生成）

## インストール
```bash
npm install
```

## 開発モード実行
```bash
npm run dev
npx electron .
```

別のターミナルで
```bash
npm start
```

## ビルド

### macOS & Windows 同時ビルド
```bash
npm run package
```

### macOS のみビルド
```bash
npm run package:mac
```

### Windows のみビルド
```bash
npm run package:win
```

ビルドされたファイルは `release` フォルダに生成されます。

## 使用方法
1. E-Bookビューアを起動し、最初のページに移動
2. キャプチャ領域の左上座標をクリック
3. キャプチャ領域の右下座標をクリック
4. 総ページ数を入力
5. PDFファイル名を入力
6. キャプチャ速度を調整（デフォルト：1000ms）
7. 「PDFを作成」ボタンをクリック

## 使用上の注意事項
- E-Bookビューアがキーボードの右矢印キーでページ遷移できる必要があります
- キャプチャ領域がビューア領域を超えないようにしてください
- ページ数が多い場合、時間がかかることがあります
- キャプチャ中は他の作業をしないでください
- 個人使用目的のみでご使用ください

## システム要件

### macOS
- macOS 10.14 以降
- 画面録画権限が必要

### Windows
- Windows 10 以降
- PowerShell 5.0 以降

## 法的告知
このプログラムは個人の学習および使用目的で作成されました。
生成されたPDFファイルを他人と共有したり、商業的に使用することは著作権法違反となります。
これに対するすべての責任は使用者にあります。

## ライセンス
Apache License 2.0

## 作成者
Created by efforthye

## 貢献
貢献は大歓迎です！お気軽にPull Requestを提出してください。

## サポート
問題が発生した場合や質問がある場合は、GitHubでIssueを開いてください。
