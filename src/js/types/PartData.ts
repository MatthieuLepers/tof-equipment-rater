import type { PartTypeEnum, StatTypeEnum } from '@/js/types/enums';

export interface IPartData {
  stats: StatTypeEnum[];
}

export type TPartsData = {
  [key in PartTypeEnum]: IPartData;
};
