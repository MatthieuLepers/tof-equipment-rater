import type { ElementTypeEnum, PartTypeEnum, StatTypeEnum } from '@/js/types/enums';

export interface ILocaleData {
  numberFormat: {
    thousandSeparator: string,
    decimalSeparator: string,
  },
  usableFor: string,
  parts: Record<PartTypeEnum, string>,
  stats: Record<StatTypeEnum, string[]>,
  dpsTypes: Record<ElementTypeEnum, string>,
}

export type TLocalesData = Record<string, ILocaleData>;
