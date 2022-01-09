'use strict';

const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
const fs = require('fs');
const defs = require('./definitions');
const { session } = defs;
const {
  getFilmsByKeywords,
  getFilmByTitle,
  renameImage,
  inlineKeyboardFilters,
  sendRandomFilm,
  sendEditedPhoto,
  getMediaType
} = require('./funcs');

const token = process.env.TELEGRAM_BOT_TOKEN2;

const bot = new TelegramBot(token, {
  polling: {
    interval: 300,
    autoStart: true,
    params: {
      timeout: 10
    }
  }
});
bot.status = session.none;

bot.on('polling_error', console.log);

bot.onText(/\/start/, (msg) => {
  const text = `Приветствую, ${msg.from.first_name}\nПришлите фото или выберите функцию👇`;
  bot.sendMessage(msg.chat.id, text, {
    reply_markup: {
      keyboard: defs.home,
      resize_keyboard: true,
    },
  });
  bot.status = session.none;
});

bot.on('photo', msg => {
  const chatId = msg.chat.id;
  bot.downloadFile(msg.photo.pop().file_id, './images').then(path => {
    const newPath = renameImage(path, chatId);
    fs.rename(path, newPath, err => {
      if (err) console.log(err);
    });
    const options = { caption: 'Current image:' };
    bot.sendPhoto(chatId, newPath, options).then(() => {
      bot.status = session.editPhoto;
      bot.sendMessage(chatId, 'What do you want to do with your image?', {
        reply_markup: inlineKeyboardFilters(newPath)
      });
    });
  });
});

bot.on('document', msg => {
  const chatId = msg.chat.id;
  const mediaType = getMediaType(msg);
  if (mediaType === 'image') {
    bot.downloadFile(msg.document.file_id, './images').then(path => {
      const newPath = renameImage(path, chatId);
      fs.rename(path, newPath, err => {
        if (err) console.log(err);
      });
      const options = { caption: 'Current image:' };
      bot.sendPhoto(chatId, newPath, options).then(() => {
        bot.status = session.editPhoto;
        bot.sendMessage(chatId, 'What do you want to do with your image?', {
          reply_markup: inlineKeyboardFilters(newPath)
        });
      });
    });
  }
});

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const data = JSON.parse(query.data);
  if (data.t === 'film') sendRandomFilm(bot, chatId, data);
  else if (data.t === 'photo') sendEditedPhoto(bot, chatId, data);
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const oddText = defs.home.concat([['/start']]);
  const msgType = msg.photo !== undefined || msg.document !== undefined;
  if (oddText.some((value) => value[0] === msg.text) || msgType) return;
  switch (bot.status) {
    case session.filmByTitle:
      const filmInfo = await getFilmByTitle(msg.text);
      bot.sendPhoto(chatId, filmInfo.poster, { caption: filmInfo.caption });
      break;
    case session.filmsByKeywords:
      const films = await getFilmsByKeywords(msg.text);
      let messageText;
      if (films !== '') messageText = films;
      else messageText = 'Ничего не найдено(';
      bot.sendMessage(chatId, messageText);
      break;
    default:
      const msgText = 'Для работы с ботом пришлите фото или выберите функцию👇';
      bot.sendMessage(chatId, msgText, {
        reply_markup: {
          keyboard: defs.home,
          resize_keyboard: true,
        },
      });
      break;
  }
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
  bot.status = session.randomFilm;
});
