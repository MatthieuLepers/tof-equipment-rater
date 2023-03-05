import fs from 'fs';
import path from 'path';
import type { TLocalesData } from '@/js/types';

const i18n: TLocalesData = fs
  .readdirSync(path.resolve(__dirname, './'))
  .reduce((acc: TLocalesData, file: string) => {
    if (!file.endsWith('.json')) return acc;
    const localeData = JSON.parse(`${fs.readFileSync(path.resolve(__dirname, './', file))}`);
    return {
      ...acc,
      [localeData.locale]: localeData.datas,
    };
  }, {})
;

export default i18n;
