import type { PartTypeEnum, StatTypeEnum } from '@/js/types/enums';

export interface OCRPartData {
  locale: string;
  type: PartTypeEnum;
  stats: Partial<{ [key in StatTypeEnum]: number }>;
}
