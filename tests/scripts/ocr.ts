import fs from 'fs';
import path from 'path';
import getTextFromImage from 'node-text-from-image';
import { serial } from '@/js/utils/PromiseUtils';

const dataDir = path.resolve(__dirname, '../datas');

serial(fs
  .readdirSync(dataDir)
  .filter((file: string) => fs.statSync(path.resolve(dataDir, file)).isDirectory() && !fs.existsSync(path.resolve(dataDir, file, 'raw.txt')))
  .map((file: string) => async () => {
    const hasJPG = fs.existsSync(path.resolve(dataDir, file, `${file}.jpg`));
    const hasPNG = fs.existsSync(path.resolve(dataDir, file, `${file}.png`));
    const imageExt = (hasJPG && 'jpg') || (hasPNG && 'png');
    const text = await getTextFromImage(path.resolve(dataDir, file, `${file}.${imageExt}`));
    fs.writeFileSync(path.resolve(dataDir, file, 'raw.txt'), text as string);
    console.log(`${file}`);
  })).then(() => process.exit())
;
