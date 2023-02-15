const fs = require('fs');
const path = require('path');
const {
  getLinesFromOCR,
  getLocale,
  getPartType,
  getStatType,
  getPartDataFromOCR,
} = require('../src/js/Logic')(console);

let data = [];
const enEN = [28];

beforeAll(() => {
  data = fs
    .readdirSync(path.resolve(__dirname, '../tmp'))
    .filter((file) => /^[0-9]+$/.test(file) && fs.statSync(path.resolve(__dirname, '../tmp', file)).isDirectory())
    .reduce((acc, fileName) => [
      ...acc,
      {
        index: parseInt(fileName, 10),
        raw: `${fs.readFileSync(path.resolve(__dirname, `../tmp/${fileName}/raw.txt`))}`,
        lines: `${fs.readFileSync(path.resolve(__dirname, `../tmp/${fileName}/lines.txt`))}`.split('\n'),
        expected: JSON.parse(`${fs.readFileSync(path.resolve(__dirname, `../tmp/${fileName}/expected.json`))}`),
      },
    ], [])
  ;
});

test('getLinesFromOCR is accurate', () => {
  data.forEach((obj) => {
    expect(getLinesFromOCR(obj.raw)).toEqual(obj.lines);
  });
});

test('getLocale is accurate', () => {
  data.forEach((obj) => {
    const [line] = obj.lines;
    const expectedLocale = enEN.includes(obj.index) ? 'en-EN' : 'fr-FR';
    expect(getLocale(line)).toBe(expectedLocale);
  });
});

test('getPartType is accurate', () => {
  data.forEach((obj) => {
    const [line] = obj.lines;
    const expectedLocale = enEN.includes(obj.index) ? 'en-EN' : 'fr-FR';
    expect(getPartType(line)(expectedLocale)).toBe(obj.expected.type);
  });
});

test('getStatType is accurate', () => {
  data.forEach((obj) => {
    const [, ...statLines] = obj.lines;
    const expectedLocale = enEN.includes(obj.index) ? 'en-EN' : 'fr-FR';

    const expectedStatTypes = Object.keys(obj.expected.stats)
      .map((statType) => statType.replace('%', ''))
    ;
    const parsedStatTypes = statLines
      .map((statLine) => getStatType(statLine)(expectedLocale))
    ;
    expect(parsedStatTypes).toEqual(expect.arrayContaining(expectedStatTypes));
  });
});

test('getPartDataFromOCR is accurate', () => {
  data.forEach((obj) => {
    expect(getPartDataFromOCR(obj.raw)).toEqual(obj.expected);
  });
});
