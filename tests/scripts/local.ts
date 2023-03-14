import fs from 'fs';
import path from 'path';
import Logic from '@/js/Logic';
import { IData } from '@tests/types';

const dataDir = path.resolve(__dirname, '../datas');
const logic = new Logic(console);

const data: IData[] = fs
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

data.forEach((obj: IData) => {
  const lines = logic.getLinesFromOCR(obj.raw);
  console.log(lines);
});
