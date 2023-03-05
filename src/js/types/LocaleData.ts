import type { ElementTypeEnum, PartTypeEnum, StatTypeEnum } from '@/js/types/enums';

export interface ILocaleData {
  numberFormat: {
    thousandSeparator: string,
    decimalSeparator: string,
  },
  usableFor: string,
  parts: { [key in PartTypeEnum]: string },
  stats: { [key in StatTypeEnum]: string[] },
  dpsTypes: { [key in ElementTypeEnum]: string },
}

export type TLocalesData = {
  [key: string]: ILocaleData;
};
