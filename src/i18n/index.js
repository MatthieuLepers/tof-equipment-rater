const fs = require('fs');
const path = require('path');

const i18n = fs
  .readdirSync(path.resolve(__dirname, './'))
  .reduce((acc, file) => {
    if (file === 'i18n.js') return acc;
    const localeData = require(path.resolve(__dirname, './', file));
    return {
      ...acc,
      [localeData.locale]: localeData.datas,
    };
  }, {})
;

module.exports = i18n;
