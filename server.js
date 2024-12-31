const express = require('express');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = 3002;  // 先ほど設定したポート番号に合わせています

// 環境変数から認証情報を読み込み
const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;
const STRAVA_REDIRECT_URI = process.env.STRAVA_REDIRECT_URI;

// トークンを保存するファイルのパス
const TOKEN_FILE = path.join(__dirname, 'token.json');

// 1. Stravaの認証ページにリダイレクト
app.get('/auth', (req, res) => {
  const authUrl = `https://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&redirect_uri=${STRAVA_REDIRECT_URI}&response_type=code&scope=activity:read_all`;
  res.redirect(authUrl);
});

// 2. Stravaからのコールバックを処理
app.get('/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const tokenResponse = await axios.post('https://www.strava.com/oauth/token', {
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code'
    });

    await fs.writeFile(TOKEN_FILE, JSON.stringify(tokenResponse.data));
    res.send('認証成功！アクセストークンを保存しました。');
  } catch (error) {
    console.error('Error getting token:', error);
    res.status(500).send('認証エラーが発生しました。');
  }
});

// 3. アクティビティデータを取得
app.get('/fetch-activities', async (req, res) => {
  try {
    const tokenData = JSON.parse(await fs.readFile(TOKEN_FILE, 'utf8'));
    const activities = await fetchAllActivities(tokenData.access_token);
    await fs.writeFile('activities.json', JSON.stringify(activities));
    res.send(`${activities.length}件のアクティビティを取得・保存しました。`);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).send('アクティビティ取得時にエラーが発生しました。');
  }
});

// すべてのアクティビティを取得する関数
async function fetchAllActivities(accessToken) {
  let page = 1;
  let allActivities = [];
  
  while (true) {
    const response = await axios.get('https://www.strava.com/api/v3/athlete/activities', {
      headers: { 'Authorization': `Bearer ${accessToken}` },
      params: { per_page: 200, page: page }
    });
    
    const activities = response.data;
    if (activities.length === 0) break;
    
    allActivities = allActivities.concat(activities);
    page++;
  }
  
  return allActivities;
}

// 静的ファイルを配信する設定
app.use(express.static('public'));

// サーバーを起動
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});