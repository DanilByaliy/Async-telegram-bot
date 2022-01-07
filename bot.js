const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv').config();
const gm = require('gm');
const fs = require('fs');

const token = process.env.TELEGRAM_BOT_TOKEN;

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

const inlineKeyboard = (path) => {
  const markup = {
    inline_keyboard: [[]]
  };
  for (const elem of ['Sticker', 'Negative', 'Sepia']) {
    markup.inline_keyboard[0].push(inlineButton(elem, path));
  }
  return markup;
};

bot.on('polling_error', (error) => {
  console.log(error);
});

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Send me your image');
});

bot.onText(/\/pic (.+)/, (msg, [source, match]) => {
  bot.sendMessage(msg.chat.id, match);
  bot.sendPhoto(msg.chat.id, './calendar.png')
});

bot.on('photo', (msg) => {
  bot.downloadFile(msg.photo.pop().file_id, './images').then((path) => {
    bot.sendMessage(msg.chat.id, 'What do you want to do with your image?', {
      reply_markup: inlineKeyboard(path)
    });
  });
});

bot.on('document', (msg) => {
  const slashIndex = msg.document.mime_type.lastIndexOf('/');
  const mediaType = msg.document.mime_type.slice(0, slashIndex);
  if (mediaType === 'image') {
    bot.downloadFile(msg.document.file_id, './images').then(async (path) => {
      const newPath = modify(path);
      gm(path).resize(512, 512, '!').write(newPath, (err) => {
        if (err) console.log(err);
        bot.sendDocument(msg.chat.id, newPath);
      });
    });
  }
});

bot.on('callback_query', async (query) => {
  const data = JSON.parse(query.data);
  const newPath = modify(data.path);
  const cases = {
    'Sticker': makeSticker,
    'Negative': makeNegative,
    'Sepia': makeSepia,
  };
  await cases[data.operation](data.path, newPath).catch((err) => {console.log(err)});
  bot.sendDocument(query.message.chat.id, newPath);
  fs.rm(newPath, (err) => {
    if (err) console.log(err);
  });
});

const makeSticker = (path, newPath) => {
  return new Promise((resolve, reject) => {
    gm(path).resize(512, 512, '!').write(newPath, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

const makeNegative = (path, newPath) => {
  return new Promise((resolve, reject) => {
    gm(path).negative().write(newPath, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

const makeSepia = (path, newPath) => {
  return new Promise((resolve, reject) => {
    gm(path).sepia().write(newPath, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

const modify = (path) => {
  const dotIndex = path.lastIndexOf('.');
  const beforeExt = path.slice(0, dotIndex);
  return './' + beforeExt + '.png';
};