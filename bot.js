const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const calendar = require('./calendar.js');
const print = require('./print.js');

const token = process.env.TELEGRAM_BOT_TOKEN;

console.log('Bot has been started....');

const bot = new TelegramBot(token, {
  polling: {
    interval: 300,
    autoStart: true,
    params: {
      timeout: 10
    }
  }
});

const send = function (msgchatid) {
  bot.sendPhoto(msgchatid, './calendar.png');
};

bot.onText(/\/pic (.+)/, (msg, [source, match]) => {
  bot.sendMessage(msg.chat.id, 'Заждіть трішки...');

  const [mons, year] = match.split('.');
  const pic = calendar.makeCurrentTable(mons, year);
  print.printCalendar(pic, send.bind(null, msg.chat.id));
});
