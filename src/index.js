'use strict';
const telegramBot = require('node-telegram-bot-api');
const keyboard = require('./keyboard');
const request = require('request');


const bot = new telegramBot('5005725004:AAHf6xAd8aZ3w7UO6_pksEA7g1X1e4H4Avc', {
  polling: true
});

const makeRequest = options => new Promise((resolve, reject) => {
  request(null, options, (error, response) => {
    if (error) reject(error);
    else resolve(JSON.parse(response.body));
  });
});

const imdbLinkGenerator = genre => {
  const preLink = 'https://imdb-api.com/API/AdvancedSearch/k_uwcunv7i?title_type=feature&user_rating=7.0,10&genres=';
  const postLink = '&groups=top_1000&count=250&sort=user_rating,desc';
  return preLink + genre + postLink;
}; //ready to use

const kinopoiskLinkGenerator = (genre, page) => {
  const preLink = 'https://kinopoiskapiunofficial.tech/api/v2.2/films?genres=';
  const postLink = '&order=RATING&type=ALL&ratingFrom=7&page=';
  return preLink + genre + postLink + page;
}; //ready to use

const kinopoiskFromImdbLinkGenerator = id => {
  const preLink = 'https://kinopoiskapiunofficial.tech/api/v2.2/films?type=ALL&imdbId=';
  const postLink = '&page=1';
  return preLink + id + postLink;
};

bot.on('callback_query', async query => {
  const info = JSON.parse(query.data);
  bot.sendMessage(query.message.chat.id, 'Ищем для вас подходящий фильм 🎥');

  const options = (genre, page) => ({
    'method': 'GET',
    'url': kinopoiskLinkGenerator(genre, page),
    'headers': {
      'X-API-KEY': '4763ee9d-133f-4291-ae48-6066a1ba76bb',
      'Content-Type': 'application/json',
    }
  });

  const showFilm = film => {
    let genreOfFilm = ' ';
    for (let genre of film.genres) {
      if (film.genres.indexOf(genre) === film.genres.length - 1) {
        genreOfFilm += genre.genre;
      } else {
        genreOfFilm += genre.genre + ', '
      }
    }
    const cap = `Название: ${film.nameRu}\nГод выпуска: ${film.year}\nРейтинг: ${film.ratingImdb}\nЖанры: ${genreOfFilm}`;
    bot.sendPhoto(query.message.chat.id, film.posterUrl, { caption: cap });
  };

  const getKinopoiskFilms = async genre => {
    const kinopoiskFilmsArr = [];
    const kinopoiskApiPagesCount = 20;
    for (let page = 1; page <= kinopoiskApiPagesCount; page++) {
      const result = await makeRequest(options(genre, page)).catch(err => console.log(err));
      kinopoiskFilmsArr.push(...result.items);
    }
    console.log(kinopoiskFilmsArr, kinopoiskFilmsArr.length);
    return kinopoiskFilmsArr;
  };

  const getImdbFilms = async genre => {
    const options = {
      'method': 'GET',
      'url': imdbLinkGenerator(genre),
    };
    const imdbFilmsArr = [];
    const result = await makeRequest(options).catch(err => console.log(err));
    imdbFilmsArr.push(...result.results);
    console.log(imdbFilmsArr.length)
    return imdbFilmsArr;
  };

  const getKinopoiskFilmFromImdb = async film => {
    const options = {
      'method': 'GET',
      'url': kinopoiskFromImdbLinkGenerator(film.id),
      'headers': {
        'X-API-KEY': '4763ee9d-133f-4291-ae48-6066a1ba76bb',
        'Content-Type': 'application/json',
      }
    };
    const res = await makeRequest(options).catch(err => console.log(err));
    return res.items[0];
  };

  const randomFilm = films => films[Math.floor(Math.random() * films.length)];

  if (info.api === 'kinopoisk') {
    showFilm(randomFilm(await getKinopoiskFilms(info.genre)));
  } else {
    showFilm(await getKinopoiskFilmFromImdb(randomFilm(await getImdbFilms(info.genre))));
  }

});

bot.on('polling_error', onerror => {
  console.log(onerror);
});

bot.onText(/Фильм по названию/, msg => {

});

bot.onText(/Случайный фильм/, msg => {
  bot.sendMessage(msg.chat.id, 'Выберите жанр', {
    reply_markup: {
      inline_keyboard: keyboard.genres
    }
  });
});

bot.onText(/\/' '/, msg => {
  bot.sendMessage(chatId, 'ваш фильм');
});

bot.onText(/\/start/, msg => {
  const text = `Приветствую, ${msg.from.first_name}\n Выберите функцию 👇`;
  bot.sendMessage(msg.chat.id, text, {
    reply_markup: {
      keyboard: keyboard.home
    }
  });
});
