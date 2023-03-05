import { PartTypeEnum, StatTypeEnum } from '@/js/types/enums';

export interface IExpectedData {
  locale: string;
  type: PartTypeEnum;
  stats: Partial<{ [key in StatTypeEnum]: number }>;
}

export interface IData {
  index: number;
  raw: string;
  lines: string[];
  expected: IExpectedData;
}
