const fs = require('fs');
const path = require('path');
// const Part = require('../src/js/classes/Part');
const { getLinesFromOCR } = require('../src/js/Logic')(console);
// const { default: getTextFromImage } = require('node-text-from-image');
// const { exit } = require('process');

// const serial = (funcs) => funcs.reduce((promise, func) => promise.then((result) => func().then(Array.prototype.concat.bind(result))), Promise.resolve([]));

// serial(fs
//   .readdirSync(path.resolve(__dirname, '../tmp'))
//   .filter((file) => fs.statSync(path.resolve(__dirname, '../tmp', file)).isDirectory())
//   .map((file) => async () => {
//     const text = await getTextFromImage(path.resolve(__dirname, '../tmp', file, `${file}.jpg`));
//     fs.writeFileSync(path.resolve(__dirname, '../tmp', file, 'raw.txt'), text);
//     console.log(file);
//   })).then(exit)
// ;

const data = fs
  .readdirSync(path.resolve(__dirname, '../tmp'))
  .filter((file) => /^[0-9]+$/.test(file) && fs.statSync(path.resolve(__dirname, '../tmp', file)).isDirectory())
  .reduce((acc, fileName) => [
    ...acc,
    {
      index: fileName,
      raw: `${fs.readFileSync(path.resolve(__dirname, `../tmp/${fileName}/raw.txt`))}`,
      lines: `${fs.readFileSync(path.resolve(__dirname, `../tmp/${fileName}/lines.txt`))}`.split('\n'),
      expected: JSON.parse(`${fs.readFileSync(path.resolve(__dirname, `../tmp/${fileName}/expected.json`))}`),
    },
  ], [])
;

data.forEach((obj) => {
  const lines = getLinesFromOCR(obj.raw);
  console.log(obj.lines.every((line) => lines.includes(line)));
});
