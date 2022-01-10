const fs = require('fs');
const PImage = require('pureimage');
const client = require('https');
const CONSTANTS = require('./constants.js');

const url = 'https://vr.josh.earth/webxr-experiments/physics/jinglesmash.thumbnail.png';
const filepath = CONSTANTS.FILE_CALENDAR_PATH;

const font = PImage.registerFont('CourierNewPS-BoldMT.ttf', 'MyFont');

const printCalendar = function (stringCalendar) {
  const promise = new Promise((resolve, reject) => {
    const lines = stringCalendar.split('.');
    font.load(() => {
      client.get(url, (imageStream) => {
        PImage.decodePNGFromStream(imageStream).then((img) => {
          const ctx = img.getContext('2d');
          ctx.fillStyle = '#000000';
          ctx.font = '20pt MyFont';
          lines.forEach((line, i) => ctx.fillText(line, 10, 100 + i * 20));
          PImage.encodePNGToStream(img, fs.createWriteStream(filepath))
            .then(() => {
              console.log('done writing to ', filepath);
              resolve();
            });
        });
      });
    });
  });
  return promise;
};

module.exports = { printCalendar };
