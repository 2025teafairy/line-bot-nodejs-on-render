const express = require('express');
const line = require('@line/bot-sdk');
const fs = require('fs');

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const app = express();
app.post('/callback', line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

const client = new line.Client(config);

// 讀取 drinks.json
const drinks = JSON.parse(fs.readFileSync('drinks.json', 'utf8'));

function getRandomDrink() {
  const allDrinks = [...drinks.純茶, ...drinks.奶茶, ...drinks.水果茶, ...drinks.其他];
  const randomIndex = Math.floor(Math.random() * allDrinks.length);
  return allDrinks[randomIndex];
}

function handleEvent(event) {
  if (event.type === 'message' && event.message.type === 'text') {
    const replyText = getRandomDrink();
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: `推薦你喝：${replyText}`,
    });
  }
  return Promise.resolve(null);
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
