'use strict';
module.exports = {

  home: [
    ['Фильм по ключевым словам'],
    ['Случайный фильм']
  ],

  genres: [
    [{ text: 'Боевик', callback_data: JSON.stringify({
      api: 'imdb',
      genre: 'action'
    }) },
    { text: 'Мультфильм', callback_data: JSON.stringify({
      api: 'imdb',
      genre: 'animation'
    }) },
    { text: 'Комедия', callback_data: JSON.stringify({
      api: 'imdb',
      genre: 'comedy'
    }) }],
    [{ text: 'Фантастика', callback_data: JSON.stringify({
      api: 'imdb',
      genre: 'fantasy'
    }) },
    { text: 'Ужасы', callback_data: JSON.stringify({
      api: 'imdb',
      genre: 'horror'
    }) },
    { text: 'Триллер', callback_data: JSON.stringify({
      api: 'imdb',
      genre: 'thriller'
    }) }],

    [
      { text: 'Драма', callback_data: JSON.stringify({
        api: 'imdb',
        genre: 'drama'
      }) },
      { text: 'Аниме', callback_data: JSON.stringify({
        api: 'kinopoisk',
        genre: 24,
      }) },
      { text: 'Детектив', callback_data: JSON.stringify({
        api: 'imdb',
        genre: 'crime'
      }) }
    ]
  ],

  genresID: {
    11: 'боевик',
    24: 'аниме',
    13: 'комедия',
    6: 'фантастика',
    17: 'ужасы',
    1: 'триллер',
  }
};
