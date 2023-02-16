const fs = require('fs');
const path = require('path');
const { getLinesFromOCR } = require('../../src/js/Logic')(console);

const data = fs
  .readdirSync(path.resolve(__dirname, './datas'))
  .filter((file) => /^[0-9]+$/.test(file) && fs.statSync(path.resolve(__dirname, './datas', file)).isDirectory())
  .reduce((acc, fileName) => [
    ...acc,
    {
      index: fileName,
      raw: `${fs.readFileSync(path.resolve(__dirname, `./datas/${fileName}/raw.txt`))}`,
      lines: `${fs.readFileSync(path.resolve(__dirname, `./datas/${fileName}/lines.txt`))}`.split('\n'),
      expected: JSON.parse(`${fs.readFileSync(path.resolve(__dirname, `./datas/${fileName}/expected.json`))}`),
    },
  ], [])
;

data.forEach((obj) => {
  const lines = getLinesFromOCR(obj.raw);
  console.log(lines);
});
