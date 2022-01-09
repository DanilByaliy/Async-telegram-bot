'use strict';

const TelegramBot = require('node-telegram-bot-api');
const defs = require('./definitions');
const { session } = defs;
const {
  randomFilm,
  mGetKinopoiskFilms,
  mGetImdbFilms,
  getKinopoiskFilmFromImdb,
  filmInfo,
  getFilmsByKeywords,
  getFilmByTitle,
} = require('./funcs');

const bot = new TelegramBot('5005725004:AAHf6xAd8aZ3w7UO6_pksEA7g1X1e4H4Avc', {
  polling: true
});

let status = session.none;

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const buttonInfo = JSON.parse(query.data);
  bot.sendMessage(chatId, 'Ищем подходящий фильм 🎥');
  let film;
  if (buttonInfo.api === 'kinopoisk') {
    film = randomFilm(await mGetKinopoiskFilms(buttonInfo.genre));
  } else {
    const randFilm = randomFilm(await mGetImdbFilms(buttonInfo.genre));
    film = await getKinopoiskFilmFromImdb(randFilm);
  }
  const info = filmInfo(film);
  bot.sendPhoto(chatId, info.poster, { caption: info.caption });
});

bot.on('polling_error', (onerror) => {
  console.log(onerror);
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  switch (status) {
    case session.none:
      bot.sendMessage(chatId, 'Для работы с ботом выберите функцию👇', {
        reply_markup: {
          keyboard: defs.home,
          resize_keyboard: true,
        },
      });
      break;
    case session.filmByTitle:
      const filmInfo = getFilmByTitle(msg.text);
      bot.sendPhoto(chatId, filmInfo.poster, { caption: filmInfo.caption })
      status = session.none;
      break;
    case session.filmsByKeywords:
      const films = await getFilmsByKeywords(msg.text);
      let messageText;
      if (films !== '') messageText = films;
      else messageText = 'Ничего не найдено(';
      bot.sendMessage(chatId, messageText);
      status = session.none;
      break;
  }
});

bot.onText(/Фильм по названию/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Введите название фильма');
  status = session.filmByTitle;
});

bot.onText(/Фильмы по ключевым словам/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Введите название фильма');
  status = session.filmsByKeywords;
});

bot.onText(/Случайный фильм/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Выберите жанр', {
    reply_markup: {
      inline_keyboard: defs.genres,
    },
  });
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
