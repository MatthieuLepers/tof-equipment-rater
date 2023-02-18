const fs = require('fs');
const path = require('path');
const { getLinesFromOCR } = require('../../src/js/Logic')(console);

const dataDir = path.resolve(__dirname, '../datas');

const data = fs
  .readdirSync(dataDir)
  .filter((file) => /^[0-9]+$/.test(file) && fs.statSync(path.resolve(dataDir, file)).isDirectory())
  .reduce((acc, fileName) => [
    ...acc,
    {
      index: fileName,
      raw: `${fs.readFileSync(path.resolve(dataDir, `${fileName}/raw.txt`))}`,
      lines: `${fs.readFileSync(path.resolve(dataDir, `${fileName}/lines.txt`))}`.split('\n'),
      expected: JSON.parse(`${fs.readFileSync(path.resolve(dataDir, `${fileName}/expected.json`))}`),
    },
  ], [])
;

data.forEach((obj) => {
  const lines = getLinesFromOCR(obj.raw);
  console.log(lines);
});
