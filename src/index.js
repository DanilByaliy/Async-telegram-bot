'use strict';

const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
const defs = require('./definitions');
const {
  randomFilm,
  mGetKinopoiskFilms,
  mGetImdbFilms,
  getKinopoiskFilmFromImdb,
  sendFilm,
} = require('./funcs');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const info = JSON.parse(query.data);
  bot.sendMessage(chatId, 'Ищем для вас подходящий фильм 🎥');
  let film;
  if (info.api === 'kinopoisk') {
    film = randomFilm(await mGetKinopoiskFilms(info.genre));
  } else {
    const randomFilm = randomFilm(await mGetImdbFilms(info.genre));
    film = await getKinopoiskFilmFromImdb(randomFilm);
  }
  sendFilm(film, chatId);
});

bot.on('polling_error', (onerror) => {
  console.log(onerror);
});

bot.onText(/Фильм по ключевым словам/, (msg) => {});

bot.onText(/Случайный фильм/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Выберите жанр', {
    reply_markup: {
      inline_keyboard: defs.genres,
    },
  });
});

bot.onText(/\/' '/, (msg) => {
  bot.sendMessage(msg.chat.id, 'ваш фильм');
});

bot.onText(/\/start/, (msg) => {
  const text = `Приветствую, ${msg.from.first_name}\nВыберите функцию👇`;
  bot.sendMessage(msg.chat.id, text, {
    reply_markup: {
      keyboard: defs.home,
      resize_keyboard: true,
    },
  });
});
