'use strict';

const TelegramBot = require('node-telegram-bot-api');
const defs = require('./definitions');
const {
  randomFilm,
  mGetKinopoiskFilms,
  mGetImdbFilms,
  getKinopoiskFilmFromImdb,
  sendFilm,
  kinopoiskKeyWordLinkGenerator,
  options,
  makeRequest,
} = require('./funcs');

const bot = new TelegramBot('5005725004:AAHf6xAd8aZ3w7UO6_pksEA7g1X1e4H4Avc', {
  polling: true,
});

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const info = JSON.parse(query.data);
  bot.sendMessage(chatId, 'Ищем подходящий фильм 🎥');
  let film;
  if (info.api === 'kinopoisk') {
    film = randomFilm(await mGetKinopoiskFilms(info.genre));
  } else {
    const randFilm = randomFilm(await mGetImdbFilms(info.genre));
    film = await getKinopoiskFilmFromImdb(randFilm);
  }
  const res = sendFilm(film);
  bot.sendPhoto(chatId, res.poster, { caption: res.caption });
});

bot.on('polling_error', (onerror) => {
  console.log(onerror);
});

bot.on('message', async (msg) => {
  const filmsArr = [];
  const link = kinopoiskKeyWordLinkGenerator(msg.text);
  const res = await makeRequest(options(link)).catch((err) => console.log(err));

  for (let page = 1; page <= res.pagesCount; page++) {
    const res = await makeRequest(options).catch((err) => console.log(err));
    filmsArr.push(...res.films);
  }
  const filtered = res.films.filter((value) => parseInt(value.rating) > 6);
  for (const film of filtered) {
    const cap = `Название: ${film.nameRu}\nГод выпуска: ${film.year}\nРейтинг: ${film.rating}`;
    bot.sendPhoto(msg.chat.id, film.posterUrl, { caption: cap });
  }
});

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
