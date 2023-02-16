const fs = require('fs');
const path = require('path');
const { default: getTextFromImage } = require('node-text-from-image');
const { exit } = require('process');

const serial = (funcs) => funcs.reduce((promise, func) => promise.then((result) => func().then(Array.prototype.concat.bind(result))), Promise.resolve([]));

const dataDir = path.resolve(__dirname, '../datas');

serial(fs
  .readdirSync(dataDir)
  .filter((file) => fs.statSync(path.resolve(dataDir, file)).isDirectory() && !fs.existsSync(path.resolve(__dirname, './datas', file, 'raw.txt')))
  .map((file) => async () => {
    const text = await getTextFromImage(path.resolve(dataDir, file, `${file}.jpg`));
    fs.writeFileSync(path.resolve(dataDir, file, 'raw.txt'), text);
    console.log(`${file}`);
  })).then(exit)
;
