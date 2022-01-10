const request = require('request');
const defs = require('./definitions');
const gm = require('gm');
const fs = require('fs');

const startMsg = (msg) =>
  `Приветствую, ${msg.from.first_name}\n` +
  'Пришлите фото, текст в виде "/calendar 01.2022" или выберите функцию👇';

const onRandomText = (msg, bot) => {
  const msgText = 'Для работы с ботом пришлите фото или выберите функцию👇';
  bot.sendMessage(msg.chat.id, msgText, {
    reply_markup: {
      keyboard: defs.home,
      resize_keyboard: true,
    },
  });
};

const onFilmByTitle = async (msg, bot) => {
  const filmInfo = await getFilmByTitle(msg.text);
  bot.sendPhoto(msg.chat.id, filmInfo.poster, { caption: filmInfo.caption });
};

const onFilmByKeywords = async (msg, bot) => {
  const films = await getFilmsByKeywords(msg.text);
  let messageText;
  if (films !== '') messageText = films;
  else messageText = 'Ничего не найдено(';
  bot.sendMessage(msg.chat.id, messageText);
};

// bohdan functions

const memoize = (fn) => {
  const cache = Object.create(null);
  return async (...args) => {
    const key = args[0];
    const val = cache[key];
    if (val) return val;
    const res = await fn(...args);
    cache[key] = res;
    return res;
  };
};

const makeRequest = (options) =>
  new Promise((resolve, reject) => {
    request(null, options, (error, response) => {
      if (error) reject(error);
      else resolve(JSON.parse(response.body));
    });
  });

const imdbLinkGenerator = (genre) => {
  const preLink = defs.imdbPrelink;
  const postLink = defs.imdbPostlink;
  return preLink + genre + postLink;
};

const kinopoiskLinkGenerator = (genre, page) => {
  const preLink = defs.kinopoiskPrelink;
  const postLink = defs.kinopoiskPostlink;
  return preLink + genre + postLink + page;
};

const kinopoiskFromImdbLinkGenerator = (id) => {
  const preLink = defs.imdbToKinopoiskPrelink;
  const postLink = defs.imdbToKinopoiskPostlink;
  return preLink + id + postLink;
};

const kinopoiskKeyWordLinkGenerator = (keyWords) => {
  const preLink = defs.kinopoiskKeyWordPrelink;
  const postLink = defs.kinopoiskKeyWordPostlink;
  return preLink + encodeURI(keyWords) + postLink;
};

const filmInfo = (film) => {
  if (film === undefined) return { poster: undefined, caption: 'Не найдено' };
  let genreOfFilm = '';
  for (const genre of film.genres) {
    if (film.genres.indexOf(genre) === film.genres.length - 1) {
      genreOfFilm += genre.genre;
    } else genreOfFilm += genre.genre + ', ';
  }
  const cap =
    `Название: ${film.nameRu}\nГод выпуска: ${film.year}\n` +
    `Рейтинг: ${film.ratingImdb}\nЖанры: ${genreOfFilm}`;
  const caption = cap.replace(/undefined/, 'отсутствует');
  return { poster: film.posterUrl, caption };
};

const options = (link) => ({
  method: 'GET',
  url: link,
  headers: {
    'X-API-KEY': '4763ee9d-133f-4291-ae48-6066a1ba76bb',
    'Content-Type': 'application/json',
  },
});

const getKinopoiskFilms = async (genre) => {
  const kinopoiskFilmsArr = [];
  for (let page = 1; page <= defs.kinopoiskApiPagesCount; page++) {
    const link = kinopoiskLinkGenerator(genre, page);
    const result = await makeRequest(options(link)).catch(console.log);
    kinopoiskFilmsArr.push(...result.items);
  }
  console.log({ length: kinopoiskFilmsArr.length });
  return kinopoiskFilmsArr;
};

const mGetKinopoiskFilms = memoize(getKinopoiskFilms);

const getImdbFilms = async (genre) => {
  const options = {
    method: 'GET',
    url: imdbLinkGenerator(genre),
  };
  const imdbFilmsArr = [];
  const result = await makeRequest(options).catch(console.log);
  imdbFilmsArr.push(...result.results);
  console.log({ length: imdbFilmsArr.length });
  return imdbFilmsArr;
};

const mGetImdbFilms = memoize(getImdbFilms);

const getKinopoiskFilmFromImdb = async (film) => {
  const link = kinopoiskFromImdbLinkGenerator(film.id);
  const res = await makeRequest(options(link)).catch(console.log);
  return res.items[0];
};

const getFilmsByKeywords = async (keywords) => {
  const filmsArr = [];
  const link = kinopoiskKeyWordLinkGenerator(keywords);
  const res = await makeRequest(options(link)).catch(console.log);
  filmsArr.push(...res.films);
  for (let page = 2; page <= res.pagesCount; page++) {
    const res = await makeRequest(options(link)).catch(console.log);
    filmsArr.push(...res.films);
  }
  const filtered = res.films.filter((film) => {
    const ratingFilter = parseInt(film.rating) > defs.preferableMinimumRating;
    const typeFilter = defs.preferableTypes.some((type) => type === film.type);
    return ratingFilter & typeFilter;
  });
  let msg = '';
  for (const film of filtered) {
    let type;
    if (film.type === 'FILM') type = 'полнометражный фильм';
    else type = 'cериал';
    if (filtered.indexOf(film) !== filtered.length - 1) {
      msg += `${film.nameRu}, ${film.year}, тип: ${type}, рейтинг: ${film.rating}/10\n`;
    } else {
      msg += `${film.nameRu}, ${film.year}, тип: ${type}, рейтинг: ${film.rating}/10`;
    }
  }
  return msg.replace(/undefined/, 'отсутствует');
};

const getFilmByTitle = async (title) => {
  const link = kinopoiskKeyWordLinkGenerator(title);
  const res = await makeRequest(options(link)).catch(console.log);
  return filmInfo(res.films[0]);
};

const randomFilm = (films) => films[Math.floor(Math.random() * films.length)];

const sendRandomFilm = async (bot, chatId, data) => {
  bot.sendMessage(chatId, 'Ищем подходящий фильм 🎥');
  let film;
  if (data.api === 'kinopoisk') {
    const films = await mGetKinopoiskFilms(data.genre).catch(console.log);
    film = randomFilm(films);
  } else {
    const films = await mGetImdbFilms(data.genre).catch(console.log);
    const randFilm = randomFilm(films);
    film = await getKinopoiskFilmFromImdb(randFilm);
  }
  const info = filmInfo(film);
  bot.sendPhoto(chatId, info.poster, { caption: info.caption });
};

// nikita functions

const inlineButtonFilter = (oper, path) => ({
  text: oper,
  callback_data: JSON.stringify({ oper, path, t: 'photo' }),
});

const inlineKeyboardFilters = (path) => {
  const markup = {
    inline_keyboard: [[]],
  };
  for (const elem of ['Sticker', 'Negative', 'Sepia']) {
    markup.inline_keyboard[0].push(inlineButtonFilter(elem, path));
  }
  return markup;
};

const makeSticker = (path, newPath) =>
  new Promise((resolve, reject) => {
    gm(path)
      .resize(512, 512, '!')
      .write(newPath, (err) => {
        if (err) reject(err);
        else resolve();
      });
  });

const makeNegative = (path, newPath) =>
  new Promise((resolve, reject) => {
    gm(path)
      .negative()
      .write(newPath, (err) => {
        if (err) reject(err);
        else resolve();
      });
  });

const makeSepia = (path, newPath) =>
  new Promise((resolve, reject) => {
    gm(path)
      .sepia()
      .write(newPath, (err) => {
        if (err) reject(err);
        else resolve();
      });
  });

const modifyPath = (data) => {
  const { path, oper } = data;
  let ext;
  if (oper === 'Sticker') ext = '.png';
  else ext = '.jpeg';
  const dotIndex = path.lastIndexOf('.');
  const beforeExt = path.slice(0, dotIndex);
  return beforeExt + '_edited' + ext;
};

const renameImage = (path, id) => {
  const slashIndex = path.lastIndexOf('/');
  const dirs = path.slice(0, slashIndex + 1);
  return dirs + id + '.jpeg';
};

const getMediaType = (msg) => {
  const slashIndex = msg.document.mime_type.lastIndexOf('/');
  return msg.document.mime_type.slice(0, slashIndex);
};

const sendEditedPhoto = async (bot, chatId, data) => {
  const newPath = modifyPath(data);
  const cases = {
    Sticker: makeSticker,
    Negative: makeNegative,
    Sepia: makeSepia,
  };
  await cases[data.oper](data.path, newPath).catch(console.log);
  bot.sendDocument(chatId, newPath);
  fs.rm(newPath, (err) => {
    if (err) console.log(err);
  });
};

// danya functions

module.exports = {
  renameImage,
  inlineKeyboardFilters,
  sendRandomFilm,
  sendEditedPhoto,
  getMediaType,
  onRandomText,
  onFilmByTitle,
  onFilmByKeywords,
  startMsg,
};
