# Strava Activity Map Visualizer

Stravaのアクティビティデータを地図上に可視化するWebアプリケーション

## 機能
- Strava APIを使用してアクティビティデータを取得
- アクティビティの種類（ランニング/サイクリング）に応じた色分け表示
- モノクロベースマップ上にアクティビティを表示
- ズームレベルに応じた線の太さの自動調整

## 使用技術
- Node.js
- Express
- Leaflet.js
- Strava API

## セットアップ方法
1. .envファイルを作成しStravaのAPI認証情報を設定
2. `npm install` で必要なパッケージをインストール
3. `node server.js` でサーバーを起動
4. ブラウザで`http://localhost:3002`にアクセス