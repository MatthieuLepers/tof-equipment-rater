const fs = require('fs');
const path = require('path');
const { default: getTextFromImage } = require('node-text-from-image');
const { exit } = require('process');

const { serial } = require('../../src/js/utils/PromiseUtils');

const dataDir = path.resolve(__dirname, '../datas');

serial(fs
  .readdirSync(dataDir)
  .filter((file) => fs.statSync(path.resolve(dataDir, file)).isDirectory() && !fs.existsSync(path.resolve(__dirname, './datas', file, 'raw.txt')))
  .map((file) => async () => {
    const hasJPG = fs.existsSync(path.resolve(dataDir, file, `${file}.jpg`));
    const hasPNG = fs.existsSync(path.resolve(dataDir, file, `${file}.png`));
    const imageExt = (hasJPG && 'jpg') || (hasPNG && 'png');
    const text = await getTextFromImage(path.resolve(dataDir, file, `${file}.${imageExt}`));
    fs.writeFileSync(path.resolve(dataDir, file, 'raw.txt'), text);
    console.log(`${file}`);
  })).then(exit)
;
