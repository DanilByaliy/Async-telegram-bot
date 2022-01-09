'use strict';
module.exports = {
  session: {
    none: 0,
    filmByTitle: 1,
    filmsByKeywords: 2,
    randomFilm: 3,
    editPhoto: 4,
  },
  home: [
    ['Фильм по названию'],
    ['Фильмы по ключевым словам'],
    ['Случайный фильм'],
  ],
  inlineButtonsGenres: [
    [
      {
        text: 'Боевик',
        callback_data: JSON.stringify({ api: 'imdb', genre: 'action', t: 'film' }),
      },
      {
        text: 'Мультфильм',
        callback_data: JSON.stringify({ api: 'imdb', genre: 'animation', t: 'film' }),
      },
      {
        text: 'Комедия',
        callback_data: JSON.stringify({ api: 'imdb', genre: 'comedy', t: 'film' }),
      },
    ],
    [
      {
        text: 'Фантастика',
        callback_data: JSON.stringify({ api: 'imdb', genre: 'fantasy', t: 'film' }),
      },
      {
        text: 'Ужасы',
        callback_data: JSON.stringify({ api: 'imdb', genre: 'horror', t: 'film' }),
      },
      {
        text: 'Триллер',
        callback_data: JSON.stringify({ api: 'imdb', genre: 'thriller', t: 'film' }),
      },
    ],
    [
      {
        text: 'Драма',
        callback_data: JSON.stringify({ api: 'imdb', genre: 'drama', t: 'film' }),
      },
      {
        text: 'Аниме',
        callback_data: JSON.stringify({ api: 'kinopoisk', genre: 24, t: 'film' }),
      },
      {
        text: 'Детектив',
        callback_data: JSON.stringify({ api: 'imdb', genre: 'crime', t: 'film' }),
      },
    ],
  ],
  kinopoiskAnimeId: 24,
  imdbPrelink:
    'https://imdb-api.com/API/AdvancedSearch/k_ulfxd37t?title_type=feature&user_rating=7.0,10&genres=',
  imdbPostlink: '&groups=top_1000&count=250&sort=user_rating,desc',
  kinopoiskPrelink:
    'https://kinopoiskapiunofficial.tech/api/v2.2/films?genres=',
  kinopoiskPostlink: '&order=RATING&type=ALL&ratingFrom=7&page=',
  imdbToKinopoiskPrelink:
    'https://kinopoiskapiunofficial.tech/api/v2.2/films?type=ALL&imdbId=',
  imdbToKinopoiskPostlink: '&page=1',
  kinopoiskKeyWordPrelink:
    'https://kinopoiskapiunofficial.tech/api/v2.1/films/search-by-keyword?keyword=',
  kinopoiskKeyWordPostlink: '&page=1',
  kinopoiskApiPagesCount: 20,
  preferableMinimumRating: 6,
  preferableTypes: ['FILM', 'TV_SERIES'],
};
