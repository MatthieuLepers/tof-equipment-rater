const Diff = require('diff');
const i18n = require('../i18n');

const Logic = (logger) => {
  const normalize = (str) => str
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
  ;

  // const regex = /([A-Za-z ]+\+[0-9]+).*$/;
  // const partRegex = /^([A-Za-z -]+(?:[0-9]+)?).*$/;
  // const statRegex = /^([A-Za-z ]+\+[0-9,.]+%?).*$/;
  // const getLinesFromOCR = (ocrText) => normalize(ocrText)
  //   .split('\n')
  //   .filter((line) => line.length > 0 && !/^\s+$/.test(line))
  //   .filter((line, i) => i === 0 || regex.test(line))
  //   .map((line, i) => (i === 0
  //     ? line.replace(partRegex, '$1')
  //     : line
  //       .split(' ')
  //       .filter((p, j) => j > 0 || p.length > 2)
  //       .join(' ')
  //       .replace(statRegex, '$1')
  //   ).trim())
  // ;

  const partRegex = /^([A-Za-z -]+)(?:[0-9]+)?.*$/;
  const statRegex = /^(?:.{0,4} )?([A-Za-z ]+\+[0-9,.]+%?).*$/;
  const getLinesFromOCR = (ocrText) => {
    const lines = normalize(ocrText)
      .split('\n')
      .filter((line) => line.length > 0 && !/^\s+$/.test(line))
      .filter((line, i) => i === 0 || statRegex.test(line))
      .map((line) => {
        if (statRegex.test(line)) {
          return line.replace(statRegex, '$1').trim();
        }
        if (partRegex.test(line)) {
          return line.replace(partRegex, '$1').trim();
        }
        return line;
      })
    ;

    if (lines.length < 5) {
      logger.log('error', 'Invalid data');
      throw new Error('Invalid data');
    }

    const [partLine, ...statLines] = lines;
    return [partLine, ...statLines.slice(-4)];
  };

  const getPartType = (line) => (locale) => {
    const dataset = i18n[locale].parts;
    const getBestDiffList = (partType) => Diff
      .diffWords(normalize(i18n[locale].parts[partType]), normalize(line.replace(/^([A-Za-z -]+)(?:[0-9]+)?.*$/, '$1').trim()))
      .find((diff, i, arr) => diff.count === Math.max(...arr.map((t) => t.count)))
    ;
    const [bestDiff] = Object
      .keys(dataset)
      .map(getBestDiffList)
      .sort((a, b) => b.count - a.count || b.value.length - a.value.length || b.value.localeCompare(a.value))
    ;

    return Object
      .keys(dataset)
      .find((partType) => normalize(i18n[locale].parts[partType]).includes(bestDiff.value))
    ;
  };

  const getStatType = (line) => (locale) => {
    const dataset = i18n[locale].stats;

    const getBestDiffList = (statText) => Diff
      .diffWords(normalize(statText), normalize(line.replace(/^([A-Za-z ]+)\+[0-9,.]+%?.*$/, '$1').trim()))
      .filter((diff) => !diff.added && !diff.removed)
      .find((diff, i, arr) => diff.count === Math.max(...arr.map((t) => t.count)))
    ;

    const [bestDiff] = Object
      .keys(dataset)
      .map((statType) => i18n[locale].stats[statType].reduce((acc, statText) => {
        const diffList = getBestDiffList(statText);
        return diffList ? [...acc, diffList] : acc;
      }, []))
      .flat()
      .sort((a, b) => b.count - a.count || b.value.length - a.value.length || b.value.localeCompare(a.value))
    ;

    return Object
      .keys(dataset)
      .find((statType) => i18n[locale].stats[statType]
        .map((t) => normalize(t))
        .includes(bestDiff?.value.trim()))
    ;
  };

  const getLocale = (line) => Object
    .keys(i18n)
    .find(getPartType(line))
  ;

  const parseValue = (locale, value) => {
    const { thousandSeparator, decimalSeparator } = i18n[locale].numberFormat;
    return parseFloat(value.replace(thousandSeparator, '').replace(decimalSeparator, '.'));
  };

  const getPartDataFromOCR = (ocrText) => {
    const [line, ...statLines] = getLinesFromOCR(ocrText);
    let locale;
    let partType;

    try {
      locale = getLocale(line);
    } catch (e) {
      logger.log('error', 'I do not recognize the language in which the text is written, I only support English and French', line, e);
      throw new Error('I do not recognize the language in which the text is written, I only support English and French');
    }

    try {
      partType = getPartType(line)(locale);
    } catch (e) {
      logger.log('error', 'I do not recognize your equipment part, try with a larger screenshot or change the game resolution to 1980x1080.', line, e);
      throw new Error('I do not recognize your equipment part, try with a larger screenshot or change the game resolution to 1980x1080');
    }

    if (locale && partType) {
      return {
        locale,
        type: partType,
        stats: statLines.reduce((acc, statLine) => {
          try {
            const statType = getStatType(statLine)(locale);
            const [, value, percent] = /^[^0-9,.]*([0-9,.]+)(%?)$/.exec(statLine);
            return {
              ...acc,
              [`${statType}${percent ? '%' : ''}`]: parseValue(locale, value),
            };
          } catch (e) {
            logger.log('error', `I do not recognize the statistic in "${line}", contact the developer so that he can remedy this.`, e);
            throw new Error(`I do not recognize the statistic in "${line}", contact the developer so that he can remedy this.`);
          }
        }, {}),
      };
    }
    return null;
  };

  return {
    getLinesFromOCR,
    normalize,
    getLocale,
    getPartType,
    getStatType,
    getPartDataFromOCR,
  };
};

module.exports = Logic;
