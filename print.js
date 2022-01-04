const fs = require('fs');
const PImage = require('pureimage');
const client = require('https');

let url = "https://vr.josh.earth/webxr-experiments/physics/jinglesmash.thumbnail.png"
let filepath = "calendar.png"

const font = PImage.registerFont('CourierNewPS-BoldMT.ttf','MyFont');

const printCalendar = function(stringCalendar, callback) {

  const lines = stringCalendar.split('.');
  font.load(() => {
    client.get(url, (image_stream)=>{
        PImage.decodePNGFromStream(image_stream).then(img => {
            const ctx = img.getContext('2d');
            ctx.fillStyle = '#000000';
            ctx.font = "20pt MyFont";
            lines.forEach((line, index) => ctx.fillText(line, 10, 100 + index*20));
            PImage.encodePNGToStream(img, fs.createWriteStream(filepath)).then(()=>{
                console.log("done writing to ", filepath)
                callback();
            })
        });
    })
  })
};

module.exports = { printCalendar }