const request = require('request');
const defs = require('./definitions');

const loger = (err) => console.log(err);

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
    const result = await makeRequest(options(link)).catch(loger);
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
  const result = await makeRequest(options).catch(loger);
  imdbFilmsArr.push(...result.results);
  console.log({ length: imdbFilmsArr.length });
  return imdbFilmsArr;
};

const mGetImdbFilms = memoize(getImdbFilms);

const getKinopoiskFilmFromImdb = async (film) => {
  const link = kinopoiskFromImdbLinkGenerator(film.id);
  const res = await makeRequest(options(link)).catch(loger);
  return res.items[0];
};

const getFilmsByKeywords = async (keywords) => {
  const filmsArr = [];
  const link = kinopoiskKeyWordLinkGenerator(keywords);
  const res = await makeRequest(options(link)).catch(loger);
  filmsArr.push(...res.films);
  for (let page = 2; page <= res.pagesCount; page++) {
    const res = await makeRequest(options(link)).catch(loger);
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
    } else
      msg += `${film.nameRu}, ${film.year}, тип: ${type}, рейтинг: ${film.rating}/10`;
  }
  return msg.replace(/undefined/, 'отсутствует');
};

const getFilmByTitle = async (title) => {
  const link = kinopoiskKeyWordLinkGenerator(title);
  const res = await makeRequest(options(link)).catch(loger);
  return filmInfo(res.films[0]);
};

const randomFilm = (films) => films[Math.floor(Math.random() * films.length)];

module.exports = {
  randomFilm,
  mGetKinopoiskFilms,
  mGetImdbFilms,
  getKinopoiskFilmFromImdb,
  getFilmsByKeywords,
  filmInfo,
  kinopoiskKeyWordLinkGenerator,
  options,
  makeRequest,
  getFilmByTitle,
};
