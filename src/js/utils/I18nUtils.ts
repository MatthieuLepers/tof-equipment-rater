import fs from 'fs';
import path from 'path';

export function getI18nFilesFromDir<T>(baseDir: string): ({ [key: string]: T }) {
  return fs
    .readdirSync(path.resolve(baseDir))
    .reduce((acc: { [key: string]: T }, file: string) => {
      if (!file.endsWith('.json')) return acc;
      const localeData = JSON.parse(`${fs.readFileSync(path.resolve(baseDir, file))}`);
      return {
        ...acc,
        [localeData.locale]: localeData.datas,
      };
    }, {})
  ;
}
