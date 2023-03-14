import type { ILocaleData, TLocalesData } from '@/js/types';
import { getI18nFilesFromDir } from '@/js/utils/I18nUtils';

export default getI18nFilesFromDir<ILocaleData>(__dirname) as TLocalesData;
