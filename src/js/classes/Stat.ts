import i18n from '@/i18n';
import StatsData from '@/js/data/stats';
import type { IStatData } from '@/js/types';
import type { ElementTypeEnum, StatTypeEnum } from '@/js/types/enums';

export default class Stat {
  constructor(
    public locale: string,
    public type: StatTypeEnum,
    public value: number,
  ) {}

  get statInfos(): IStatData {
    return StatsData[this.type];
  }

  get percent(): number {
    const { initial, max } = this.statInfos;
    return (this.value - initial) / (max * 5);
  }

  get name(): string {
    const [name] = i18n[this.locale].stats[this.type.replace('%', '') as StatTypeEnum];
    return `${name}${this.type.endsWith('%') ? ' (%)' : ''}`;
  }

  get dpsName(): string {
    return i18n[this.locale].dpsTypes?.[this.type.replace(/^([a-z]+).*$/, '$1') as ElementTypeEnum] ?? '';
  }

  isElemental(): boolean {
    return ['frost', 'flame', 'volt', 'physical', 'altered']
      .some((statType) => this.type.startsWith(statType))
    ;
  }

  isAttack(): boolean {
    return this.type.toLowerCase().includes('atk');
  }

  isResistance(): boolean {
    return this.type.toLowerCase().includes('res');
  }

  isDamageBoost(): boolean {
    return this.type.toLowerCase().includes('dmgboost');
  }

  isPercent(): boolean {
    return this.type.endsWith('%');
  }

  isFlat(): boolean {
    return !this.type.endsWith('%');
  }
}
