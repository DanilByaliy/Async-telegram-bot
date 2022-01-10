const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
const fs = require('fs');
const CONSTANTS = require('./constants.js');
const calendar = require('./calendar.js');
const print = require('./print.js');
const defs = require('./definitions');
const { session } = defs;
const {
  renameImage,
  inlineKeyboardFilters,
  sendRandomFilm,
  sendEditedPhoto,
  getMediaType,
  onRandomText,
  onFilmByTitle,
  onFilmByKeywords,
  startMsg,
} = require('./funcs');

const token = process.env.TELEGRAM_BOT_TOKEN2;

const bot = new TelegramBot(token, {
  polling: {
    interval: 300,
    autoStart: true,
    params: {
      timeout: 10,
    },
  },
});
bot.status = session.none;

bot.on('polling_error', console.log);

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, startMsg(msg), {
    reply_markup: {
      keyboard: defs.home,
      resize_keyboard: true,
    },
  });
  bot.status = session.none;
});

bot.on('photo', (msg) => {
  const chatId = msg.chat.id;
  bot.downloadFile(msg.photo.pop().file_id, './images').then((path) => {
    const newPath = renameImage(path, chatId);
    fs.rename(path, newPath, (err) => {
      if (err) console.log(err);
    });
    const options = { caption: 'Current image:' };
    bot.sendPhoto(chatId, newPath, options).then(() => {
      bot.status = session.none;
      bot.sendMessage(chatId, 'What do you want to do with your image?', {
        reply_markup: inlineKeyboardFilters(newPath),
      });
    });
  });
});

bot.on('document', (msg) => {
  const mediaType = getMediaType(msg);
  if (mediaType !== 'image') return;
  const chatId = msg.chat.id;
  bot.downloadFile(msg.document.file_id, './images').then((path) => {
    const newPath = renameImage(path, chatId);
    fs.rename(path, newPath, (err) => {
      if (err) console.log(err);
    });
    const options = { caption: 'Current image:' };
    bot.sendPhoto(chatId, newPath, options).then(() => {
      bot.status = session.none;
      bot.sendMessage(chatId, 'What do you want to do with your image?', {
        reply_markup: inlineKeyboardFilters(newPath),
      });
    });
  });
});

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const data = JSON.parse(query.data);
  const options = {
    film: sendRandomFilm,
    photo: sendEditedPhoto,
  };
  options[data.t](bot, chatId, data);
});

bot.on('message', async (msg) => {
  const oddText = defs.home.concat([['/start']]);
  const ifMenuOptions = oddText.some((value) => value[0] === msg.text);
  const ifMsgType = msg.photo !== undefined || msg.document !== undefined;
  const ifCalendar = msg.text !== undefined && msg.text.includes('/calendar');
  if (ifMenuOptions || ifMsgType || ifCalendar) return;
  const options = [onRandomText, onFilmByTitle, onFilmByKeywords];
  options[bot.status](msg, bot);
  bot.status = session.none;
});

bot.onText(/Фильм по названию/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Введите название фильма');
  bot.status = session.filmByTitle;
});

bot.onText(/Фильмы по ключевым словам/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Введите ключевые слова');
  bot.status = session.filmsByKeywords;
});

bot.onText(/Случайный фильм/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Выберите жанр', {
    reply_markup: {
      inline_keyboard: defs.inlineButtonsGenres,
    },
  });
  bot.status = session.none;
});

bot.onText(/\/calendar (.+)/, (msg, [source, match]) => {
  bot.sendMessage(msg.chat.id, CONSTANTS.MESSAGE);
  const [month, year] = match.split(CONSTANTS.DOT);
  calendar
    .readFile()
    .then((value) => {
      const table = calendar.makeCurrentTable(month, year, value);
      return print.printCalendar(table);
    })
    .then(() => {
      bot.sendPhoto(msg.chat.id, CONSTANTS.FILE_CALENDAR_PATH);
    });
});
