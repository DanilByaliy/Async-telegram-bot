const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv').config();

const token = process.env.TELEGRAM_BOT_TOKEN;

console.log("Bot has been started....");

const bot = new TelegramBot(token, {
  polling: {
    interval: 300,
    autoStart: true,
    params: {
      timeout: 10 
    }
  }
});

bot.onText(/\/pic (.+)/, (msg, [source, match]) => {
  
  bot.sendMessage(msg.chat.id, match);
  bot.sendPhoto(msg.chat.id, './calendar.png')
})
