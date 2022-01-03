const fs = require('fs');
const PImage = require('pureimage');
const client = require('https');

let url = "https://vr.josh.earth/webxr-experiments/physics/jinglesmash.thumbnail.png"
let filepath = "calendar.png"

const font = PImage.registerFont('CourierNewPS-BoldMT.ttf','MyFont');

const fun = function(ddd, callback) {

  const [a, b, c, d, q, w, e, r, t, y, u, i, o, p, l] = ddd.split('.')
  font.load(() => {
    client.get(url, (image_stream)=>{
        PImage.decodePNGFromStream(image_stream).then(img => {
            const ctx = img.getContext('2d');
            ctx.fillStyle = '#000000';
            ctx.font = "20pt MyFont";
            ctx.fillText(a, 10, 100);
            ctx.fillText(b, 10, 120);
            ctx.fillText(c, 10, 140);
            ctx.fillText(d, 10, 160);
            ctx.fillText(q, 10, 180);
            ctx.fillText(w, 10, 200);
            ctx.fillText(e, 10, 220);
            ctx.fillText(r, 10, 240);
            ctx.fillText(t, 10, 260);
            ctx.fillText(y, 10, 280);
            ctx.fillText(u, 10, 300);
            ctx.fillText(i, 10, 320);
            ctx.fillText(o, 10, 340);
            ctx.fillText(p, 10, 360);
            ctx.fillText(l, 10, 380);
            ctx.fillText(l, 10, 380);
            PImage.encodePNGToStream(img, fs.createWriteStream(filepath)).then(()=>{
                console.log("done writing to ", filepath)
                callback();
            })
        });
    })
  })
};

module.exports = { fun }