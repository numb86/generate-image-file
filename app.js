const fs = require('fs');
const Canvas = require('canvas');
const program = require('commander');
const bytes = require('bytes');

const MAX_LIMIT_BYTE_SIZE = 52428800;

const DEFAULT_WIDTH = 200;
const DEFAULT_HEIGHT = 200;
const MINIMUM_WIDTH = 1;
const MINIMUM_HEIGHT = 1;

const FILL_COLOR = '#87CEFA';

// サイズのデリミタとして使える文字列 優先度順に並んでいる
const DELIMITER_LIST = [
  ',', // 200,200
  '*', // 200*200
];

program
  .version('0.1.1')
  .option('-s, --size <width,height>', 'Specify width * height')
  .option(
    '-b, --byte <byte size>',
    'Specify file size. Format is *b or *kb or *mb'
  )
  .option('-f, --fill', 'fill image')
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

function fillImage(canvas) {
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = FILL_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function generateSpecifiedSizeBuffer(width, height, callback) {
  const canvas = new Canvas.Canvas(width, height);
  if (program.fill) fillImage(canvas);
  canvas.toBuffer((err, buf) => {
    if (err) throw new Error(err);
    callback(buf);
  });
}

function validateByteInputValue(specifiedByte) {
  if (!isFinite(specifiedByte)) {
    failProcess('Invalid input value. Byte specify format is *b or *kb or *mb');
  }
  if (specifiedByte > MAX_LIMIT_BYTE_SIZE) {
    failProcess('The input value is too large. The maximum value is 50 MB.');
  }
}

function generateSpecifiedByteBuffer(specifiedByte, argBuf, callback) {
  const canvas = new Canvas.Canvas(MINIMUM_WIDTH, MINIMUM_HEIGHT);
  if (program.fill) fillImage(canvas);
  canvas.toBuffer((err, buf) => {
    if (err) throw new Error(err);
    const baseBuf = argBuf || buf;
    const array = baseBuf.toJSON().data;
    const diff = specifiedByte - array.length;
    if (diff < 0)
      failProcess(
        `You can't specify this byte size. ${bytes(
          specifiedByte
        )} is too small.`
      );
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
    case !!(size && byte): {
      const specifiedByte = bytes(byte);
      validateByteInputValue(specifiedByte);
      generateSpecifiedSizeBuffer(...getSpecifySize(program.size), buf => {
        generateSpecifiedByteBuffer(specifiedByte, buf, byteAdjustedBuf => {
          outputImageFile(byteAdjustedBuf);
        });
      });
      break;
    }
    case !!size:
      generateSpecifiedSizeBuffer(...getSpecifySize(program.size), buf => {
        outputImageFile(buf);
      });
      break;
    case !!byte: {
      const specifiedByte = bytes(byte);
      validateByteInputValue(specifiedByte);
      generateSpecifiedByteBuffer(specifiedByte, null, buf => {
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
