const fs = require('fs');
const path = require('path');

const i18n = fs
  .readdirSync(path.resolve(__dirname, './'))
  .reduce((acc, file) => {
    if (!file.endsWith('.json')) return acc;
    const localeData = JSON.parse(`${fs.readFileSync(path.resolve(__dirname, './', file))}`);
    return {
      ...acc,
      [localeData.locale]: localeData.datas,
    };
  }, {})
;

module.exports = i18n;
