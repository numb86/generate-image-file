const fs = require('fs');
const Canvas = require('canvas');
const program = require('commander');
const bytes = require('bytes');

const MAX_LIMIT_BYTE_SIZE = 52428800;

const DEFAULT_WIDTH = 200;
const DEFAULT_HEIGHT = 200;

// サイズのデリミタとして使える文字列 優先度順に並んでいる
const DELIMITER_LIST = [
  ',', // 200,200
  '*', // 200*200
];

program
  .version('0.0.0')
  .option('-s, --size <width,height>', 'Specify width * height')
  .option(
    '-b, --byte <byte size>',
    'Specify file size. Format is *b or *kb or *mb'
  )
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

function generateSpecifiedSizeBuffer(width, height, callback) {
  const canvas = new Canvas(width, height);
  canvas.toBuffer((err, buf) => {
    if (err) throw new Error(err);
    callback(buf);
  });
}

function generateSpecifiedByteBuffer(specifiedByte, callback) {
  const canvas = new Canvas(1, 1);
  canvas.toBuffer((err, buf) => {
    if (err) throw new Error(err);
    const array = buf.toJSON().data;
    const diff = specifiedByte - array.length;
    if (diff < 0) failProcess(`You can't specify this byte size.`);
    for (let i = 0; i < diff; i += 1) {
      array.push(0);
    }
    const byteAdjustedBuf = Buffer.from(array);
    callback(byteAdjustedBuf);
  });
}

function outputImageFile(buf) {
  fs.writeFile(`images/${new Date().toISOString()}.png`, buf, err => {
    if (err) throw new Error(err);
    console.log(`Byte size is ${bytes(buf.length, {unitSeparator: ' '})}.`);
  });
}

(() => {
  console.log('processing...');
  const {size, byte} = program;
  switch (true) {
    case !!(size && byte):
      break;
    case !!size:
      generateSpecifiedSizeBuffer(...getSpecifySize(program.size), buf => {
        outputImageFile(buf);
      });
      break;
    case !!byte: {
      const specifiedByte = bytes(byte);
      if (!isFinite(specifiedByte)) {
        failProcess('Invalid input value. Format is *b or *kb or *mb');
      }
      if (specifiedByte > MAX_LIMIT_BYTE_SIZE) {
        failProcess(
          'The input value is too large. The maximum value is 50 MB.'
        );
      }
      generateSpecifiedByteBuffer(specifiedByte, buf => {
        outputImageFile(buf);
      });
      break;
    }
    default:
      generateSpecifiedSizeBuffer(DEFAULT_WIDTH, DEFAULT_HEIGHT, buf => {
        outputImageFile(buf);
      });
      break;
  }
})();
