import type { StatTypeEnum } from '@/js/types/enums';

export interface IStatData {
  initial: number,
  min: number,
  max: number,
}

export type TStatsData = Record<StatTypeEnum, IStatData>;
