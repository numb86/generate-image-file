const fs = require('fs');
const Canvas = require('canvas');
const program = require('commander');
const bytes = require('bytes');

const DEFAULT_WIDTH = 200;
const DEFAULT_HEIGHT = 200;

// サイズのデリミタとして使える文字列 優先度順に並んでいる
const DELIMITER_LIST = [
  ',', // 200,200
  '*', // 200*200
];

program
  .version('0.0.0')
  .option('-s, --size <width,height>', 'specify width * height')
  .parse(process.argv);

function failProcess(message) {
  console.error('\n', message, '\n');
  process.exit(1);
}

function getDelimiter(userInputValue) {
  const result = DELIMITER_LIST.filter(
    delimiter => userInputValue.indexOf(delimiter) !== -1
  );
  if (result.length === 0) {
    failProcess('You should specify px size. --size <width,height>');
  }
  return result[0];
}

function getSpecifySize(userInputValue) {
  const delimiter = getDelimiter(userInputValue);
  let [width, height] = userInputValue.split(delimiter);
  width = +width;
  height = +height;
  if (!isFinite(width) || width === 0 || !isFinite(height) || height === 0) {
    failProcess('You should specify px size. --size <width,height>');
  }
  return [width, height];
}

function generateImage(width, height) {
  const canvas = new Canvas(width, height);
  canvas.toBuffer((err, buf) => {
    if (err) throw new Error(err);
    fs.writeFile(`images/${new Date().toISOString()}.png`, buf, fsErr => {
      if (fsErr) throw new Error(fsErr);
      console.log(`Generate ${width} * ${height} image.`);
      console.log(`File size is ${bytes(buf.length, {unitSeparator: ' '})}.`);
    });
  });
}

if (program.size) {
  generateImage(...getSpecifySize(program.size));
} else {
  generateImage(DEFAULT_WIDTH, DEFAULT_HEIGHT);
}
