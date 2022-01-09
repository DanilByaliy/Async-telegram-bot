'use strict';
module.exports = {
  session: {
    none: 0,
    filmByTitle: 1,
    filmsByKeywords: 2,
  },
  home: [
    ['Фильм по названию'],
    ['Фильмы по ключевым словам'],
    ['Случайный фильм'],
  ],
  genres: [
    [
      {
        text: 'Боевик',
        callback_data: JSON.stringify({
          api: 'imdb',
          genre: 'action',
        }),
      },
      {
        text: 'Мультфильм',
        callback_data: JSON.stringify({
          api: 'imdb',
          genre: 'animation',
        }),
      },
      {
        text: 'Комедия',
        callback_data: JSON.stringify({
          api: 'imdb',
          genre: 'comedy',
        }),
      },
    ],
    [
      {
        text: 'Фантастика',
        callback_data: JSON.stringify({
          api: 'imdb',
          genre: 'fantasy',
        }),
      },
      {
        text: 'Ужасы',
        callback_data: JSON.stringify({
          api: 'imdb',
          genre: 'horror',
        }),
      },
      {
        text: 'Триллер',
        callback_data: JSON.stringify({
          api: 'imdb',
          genre: 'thriller',
        }),
      },
    ],
    [
      {
        text: 'Драма',
        callback_data: JSON.stringify({
          api: 'imdb',
          genre: 'drama',
        }),
      },
      {
        text: 'Аниме',
        callback_data: JSON.stringify({
          api: 'kinopoisk',
          genre: 24,
        }),
      },
      {
        text: 'Детектив',
        callback_data: JSON.stringify({
          api: 'imdb',
          genre: 'crime',
        }),
      },
    ],
  ],
  genresID: {
    11: 'боевик',
    24: 'аниме',
    13: 'комедия',
    6: 'фантастика',
    17: 'ужасы',
    1: 'триллер',
  },
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
