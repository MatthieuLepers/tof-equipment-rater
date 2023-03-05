import fs from 'fs';
import path from 'path';
import Logic from '@/js/Logic';
import { IData } from '@tests/types';

let data: IData[] = [];
const logic = new Logic(console);
const dataDir = path.resolve(__dirname, './datas');

beforeAll(() => {
  data = fs
    .readdirSync(dataDir)
    .filter((file: string) => /^[0-9]+$/.test(file) && fs.statSync(path.resolve(dataDir, file)).isDirectory())
    .reduce((acc: IData[], fileName: string) => [
      ...acc,
      {
        index: parseInt(fileName, 10),
        raw: `${fs.readFileSync(path.resolve(dataDir, `${fileName}/raw.txt`))}`,
        lines: `${fs.readFileSync(path.resolve(dataDir, `${fileName}/lines.txt`))}`.split('\n'),
        expected: JSON.parse(`${fs.readFileSync(path.resolve(dataDir, `${fileName}/expected.json`))}`),
      },
    ], [])
  ;
});

test('getLinesFromOCR is accurate', () => {
  data.forEach((obj) => {
    expect(logic.getLinesFromOCR(obj.raw)).toEqual(obj.lines);
  });
});

test('getLocale is accurate', () => {
  data.forEach((obj) => {
    const [line] = obj.lines;
    expect(logic.getLocale(line)).toBe(obj.expected.locale);
  });
});

test('getPartType is accurate', () => {
  data.forEach((obj) => {
    const [line] = obj.lines;
    const expectedLocale = obj.expected.locale;
    expect(logic.getPartType(line, expectedLocale)).toBe(obj.expected.type);
  });
});

test('getStatType is accurate', () => {
  data.forEach((obj) => {
    const [, ...statLines] = obj.lines;
    const expectedLocale = obj.expected.locale;

    const expectedStatTypes = Object.keys(obj.expected.stats)
      .map((statType) => statType.replace('%', ''))
    ;
    const parsedStatTypes = statLines
      .map((statLine) => logic.getStatType(statLine, expectedLocale))
    ;
    expect(parsedStatTypes).toEqual(expect.arrayContaining(expectedStatTypes));
  });
});

test('getPartDataFromOCR is accurate', () => {
  data.forEach((obj) => {
    expect(logic.getPartDataFromOCR(obj.raw)).toEqual(obj.expected);
  });
});
