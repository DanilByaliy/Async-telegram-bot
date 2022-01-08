'use strict';

const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
const gm = require('gm');
const fs = require('fs');

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

const inlineButton = (operation, path) => ({
  text: operation,
  callback_data: JSON.stringify({ operation, path })
});

const inlineKeyboard = path => {
  const markup = {
    inline_keyboard: [[]]
  };
  for (const elem of ['Sticker', 'Negative', 'Sepia']) {
    markup.inline_keyboard[0].push(inlineButton(elem, path));
  }
  return markup;
};

const makeSticker = (path, newPath) => new Promise((resolve, reject) => {
  gm(path).resize(512, 512, '!').write(newPath, err => {
    if (err) reject(err);
    else resolve();
  });
});

const makeNegative = (path, newPath) => new Promise((resolve, reject) => {
  gm(path).negative().write(newPath, err => {
    if (err) reject(err);
    else resolve();
  });
});

const makeSepia = (path, newPath) => new Promise((resolve, reject) => {
  gm(path).sepia().write(newPath, err => {
    if (err) reject(err);
    else resolve();
  });
});

const modify = data => {
  const { path, operation } = data;
  let ext;
  if (operation === 'Sticker') ext = '.png';
  else ext = '.jpeg';
  const dotIndex = path.lastIndexOf('.');
  const beforeExt = path.slice(0, dotIndex);
  return beforeExt + '_edited' + ext;
};

const rename = (path, id) => {
  const slashIndex = path.lastIndexOf('/');
  const dirs = path.slice(0, slashIndex + 1);
  return dirs + id + '.jpeg';
};

bot.on('polling_error', error => {
  console.log(error);
});

bot.onText(/\/start/, msg => {
  bot.sendMessage(msg.chat.id, 'Send me your image');
});

bot.on('photo', msg => {
  const chatId = msg.chat.id;
  bot.downloadFile(msg.photo.pop().file_id, './images').then(path => {
    const newPath = rename(path, chatId);
    fs.rename(path, newPath, err => {
      if (err) console.log(err);
    });
    const options = { caption: 'Current image:' };
    bot.sendPhoto(chatId, newPath, options).then(() => {
      bot.sendMessage(chatId, 'What do you want to do with your image?', {
        reply_markup: inlineKeyboard(newPath)
      });
    });
  });
});

bot.on('document', msg => {
  const chatId = msg.chat.id;
  const slashIndex = msg.document.mime_type.lastIndexOf('/');
  const mediaType = msg.document.mime_type.slice(0, slashIndex);
  if (mediaType === 'image') {
    bot.downloadFile(msg.document.file_id, './images').then(path => {
      const newPath = rename(path, chatId);
      fs.rename(path, newPath, err => {
        if (err) console.log(err);
      });
      const options = { caption: 'Current image:' };
      bot.sendPhoto(chatId, newPath, options).then(() => {
        bot.sendMessage(chatId, 'What do you want to do with your image?', {
          reply_markup: inlineKeyboard(newPath)
        });
      });
    });
  }
});

bot.on('callback_query', async query  => {
  const data = JSON.parse(query.data);
  const newPath = modify(data);
  const cases = {
    'Sticker': makeSticker,
    'Negative': makeNegative,
    'Sepia': makeSepia,
  };
  await cases[data.operation](data.path, newPath)
    .catch(err => { console.log(err); });
  bot.sendDocument(query.message.chat.id, newPath);
  fs.rm(newPath, err => {
    if (err) console.log(err);
  });
});
