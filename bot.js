const TelegramBot = require('node-telegram-bot-api');
const CONSTANTS = require('./constants.js');
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

bot.onText(/\/calendar (.+)/, (msg, [source, match]) => {
  bot.sendMessage(msg.chat.id, CONSTANTS.MESSAGE);

  const [month, year] = match.split(CONSTANTS.DOT);
  calendar.readFile().then((value) => {
    const table = calendar.makeCurrentTable(month, year, value);
    return print.printCalendar(table);
  }).then(() => {
    bot.sendPhoto(msg.chat.id, CONSTANTS.FILE_CALENDAR_PATH);
  });
});

// const pic = calendar.makeCurrentTable(mons, year);
// print.printCalendar(pic, send.bind(null, msg.chat.id));
