import Stat from '@/js/classes/Stat';
import Logic from '@/js/Logic';
import PartsData from '@/js/data/parts';
import i18n from '@/i18n';
import type { PartTypeEnum, StatTypeEnum } from '@/js/types/enums';
import type { ILogger, IPartData } from '@/js/types';

export default class Part {
  constructor(
    public locale: string,
    public type: PartTypeEnum,
    public stats: Stat[],
  ) {}

  get partInfos(): IPartData {
    return PartsData[this.type];
  }

  get name(): string {
    return i18n[this.locale].parts[this.type];
  }

  static fromOCR(ocrText: string, logger: ILogger, userLocale: string | undefined): Part {
    const { locale, type, stats } = new Logic(logger, userLocale).getPartDataFromOCR(ocrText);
    return new Part(
      locale,
      type,
      Object.keys(stats).map((statType) => new Stat(locale, statType as StatTypeEnum, stats[statType as StatTypeEnum] as number)),
    );
  }

  isVeraPart(): boolean {
    return ['combatEngine', 'tacticsEyepiece', 'microReactor', 'exoskeleton'].includes(this.type);
  }

  rate(): string {
    const [longestStatName] = this.stats.map((stat) => stat.name).sort((a, b) => b.length - a.length);
    const separator = (banner = '') => banner
      .padStart(((longestStatName.length + 9) / 2) + (banner.length / 2), '-')
      .padEnd(longestStatName.length + 9, '-')
      ;

    const statList = this.stats
      .sort((a, b) => b.percent - a.percent)
      .map((stat) => `${stat.name.padEnd(longestStatName.length, ' ')} : ${(stat.percent * 100).toFixed(2).padStart(5, ' ')}%`)
      .join('\n')
      ;

    const result = [
      this.name,
      separator(),
      statList,
    ];
    const toAdd = [];

    // Crit
    const critStat = this.stats.find((stat) => stat.type === 'crit');
    if (!this.isVeraPart() && critStat) {
      toAdd.push(`${critStat.name.padEnd(longestStatName.length, ' ')} : ${(critStat.percent * 100).toFixed(2).padStart(5, ' ')}%`);
    }

    // Rate DPS
    const hasFlatElementalStats = this.stats.some((stat) => stat.isElemental() && stat.isAttack() && stat.isFlat() && stat.percent > 0);
    if (!this.isVeraPart() && hasFlatElementalStats) {
      toAdd.push(...this.#rateDPS.call(this, { lineLength: longestStatName.length }));
    }

    if (toAdd.length) {
      toAdd.unshift(separator(i18n[this.locale].usableFor));
      result.push(...toAdd);
    }

    return `${result.join('\n')}\n`;
  }

  #rateDPS(options: { lineLength: number }): string[] {
    const atkStat = this.stats.find((stat) => stat.type === 'atk');
    const getElementalRate = (elementalStat: Stat) => {
      const min = elementalStat.statInfos.initial + (atkStat?.statInfos.initial ?? 52);
      const max = min + (elementalStat.statInfos.max * 5);
      const value = elementalStat.value + (atkStat?.value ?? 0);

      return (value - min) / (max - min);
    };
    const elementalStatList = this.stats
      .filter((stat) => stat.isElemental() && stat.isAttack() && stat.isFlat() && stat.percent > 0)
      .sort((a, b) => getElementalRate(b) - getElementalRate(a))
      .map((stat) => `${stat.dpsName.padEnd(options.lineLength, ' ')} : ${(getElementalRate(stat) * 100).toFixed(2).padStart(5, ' ')}%`)
      .join('\n')
    ;

    return [elementalStatList];
  }
}
