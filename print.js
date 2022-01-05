const fs = require('fs');
const PImage = require('pureimage');
const client = require('https');

const url = 'https://vr.josh.earth/webxr-experiments/physics/jinglesmash.thumbnail.png';
const filepath = 'calendar.png';

const font = PImage.registerFont('CourierNewPS-BoldMT.ttf', 'MyFont');

const printCalendar = function (stringCalendar, callback) {
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
            callback();
          });
      });
    });
  });
};

module.exports = { printCalendar };
