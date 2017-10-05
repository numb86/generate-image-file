const fs = require('fs');
const Canvas = require('canvas');

const canvas = new Canvas(600, 600);

canvas.toBuffer((err, buf) => {
  if (err) throw new Error(err);
  fs.writeFile(`images/${new Date().toISOString()}.png`, buf, fsErr => {
    if (fsErr) throw new Error(fsErr);
  });
});
