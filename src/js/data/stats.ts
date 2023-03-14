import { StatTypeEnum } from '@/js/types/enums';
import type { TStatsData } from '@/js/types/StatData';

const elementalAtk: Partial<TStatsData> = [
  StatTypeEnum.FROSTATK,
  StatTypeEnum.VOLTATK,
  StatTypeEnum.FLAMEATK,
  StatTypeEnum.ALTEREDATK,
].reduce((acc: Partial<TStatsData>, statType: StatTypeEnum) => ({
  ...acc,
  [statType]: {
    initial: 69,
    min: 125,
    max: 312,
  },
}), {});

const elementalAtkPercent: Partial<TStatsData> = [
  StatTypeEnum.FROSTATK_PERCENT,
  StatTypeEnum.VOLTATK_PERCENT,
  StatTypeEnum.FLAMEATK_PERCENT,
  StatTypeEnum.PHYSICALATK_PERCENT,
  StatTypeEnum.ALTEREDATK_PERCENT,
].reduce((acc: Partial<TStatsData>, statType: StatTypeEnum) => ({
  ...acc,
  [statType]: {
    initial: 1.26,
    min: 1.44,
    max: 1.44,
  },
}), {});

const elementalDmgBoostPercent: Partial<TStatsData> = [
  StatTypeEnum.FROSTDMGBOOST,
  StatTypeEnum.VOLTDMGBOOST,
  StatTypeEnum.FLAMEDMGBOOST,
  StatTypeEnum.PHYSICALDMGBOOST,
  StatTypeEnum.ALTEREDDMGBOOST,
].reduce((acc: Partial<TStatsData>, statType: StatTypeEnum) => ({
  ...acc,
  [statType]: {
    initial: 0.65,
    min: 0.72,
    max: 0.72,
  },
}), {});

const elementalRes: Partial<TStatsData> = [
  StatTypeEnum.FROSTRES,
  StatTypeEnum.VOLTRES,
  StatTypeEnum.FLAMERES,
  StatTypeEnum.PHYSICALRES,
  StatTypeEnum.ALTEREDRES,
].reduce((acc: Partial<TStatsData>, statType: StatTypeEnum) => ({
  ...acc,
  [statType]: {
    initial: 215,
    min: 390,
    max: 974,
  },
}), {});

const elementalResPercent: Partial<TStatsData> = [
  StatTypeEnum.FROSTRES_PERCENT,
  StatTypeEnum.VOLTRES_PERCENT,
  StatTypeEnum.FLAMERES_PERCENT,
  StatTypeEnum.PHYSICALRES_PERCENT,
  StatTypeEnum.ALTEREDRES_PERCENT,
].reduce((acc: Partial<TStatsData>, statType: StatTypeEnum) => ({
  ...acc,
  [statType]: {
    initial: 7.87,
    min: 9,
    max: 9,
  },
}), {});

export default {
  atk: {
    initial: 52,
    min: 93,
    max: 234,
  },
  ...elementalAtk,
  ...elementalAtkPercent,
  ...elementalDmgBoostPercent,
  res: {
    initial: 64,
    min: 117,
    max: 292,
  },
  ...elementalRes,
  ...elementalResPercent,
  crit: {
    initial: 258,
    min: 468,
    max: 1169,
  },
  'critRate%': {
    initial: 1.05,
    min: 1.19,
    max: 1.19,
  },
  hp: {
    initial: 4125,
    min: 7480,
    max: 18700,
  },
  'hp%': {
    initial: 0.94,
    min: 1.08,
    max: 1.08,
  },
} as TStatsData;
