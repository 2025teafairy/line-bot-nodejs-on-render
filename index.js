const express = require('express');
const line = require('@line/bot-sdk');
const fs = require('fs');

// 讀取 drinks.json 的飲料清單
const drinks = JSON.parse(fs.readFileSync('./drinks.json', 'utf8'));

// LINE Channel 設定（從環境變數抓取）
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

const client = new line.Client(config);
const app = express();

// 設定 webhook 路由
app.post('/callback', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

// 處理傳來的訊息事件
function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  // 隨機從清單中選出一杯飲料
  const randomDrink = drinks[Math.floor(Math.random() * drinks.length)];
  const replyText = `推薦給你一杯：${randomDrink.name}（${randomDrink.category}）🍹`;

  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: replyText,
  });
}

// 啟動伺服器
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`伺服器已啟動，監聽 port ${port}`);
});
