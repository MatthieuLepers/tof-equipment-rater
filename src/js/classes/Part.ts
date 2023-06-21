import Stat from '@/js/classes/Stat';
import Logic from '@/js/Logic';
import PartsData from '@/js/data/parts';
import i18n from '@/i18n';
import type { PartTypeEnum, StatTypeEnum } from '@/js/types/enums';
import type { ILogger, IPartData } from '@/js/types';
import { EmbedFieldData, MessageEmbed } from 'discord.js';

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

  #rateDPS(): EmbedFieldData[] {
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
      .map((stat) => ({
        name: stat.dpsName,
        value: `\`${(getElementalRate(stat) * 100).toFixed(2)}%\``,
        inline: true,
      }))
    ;

    return elementalStatList;
  }

  asMessageEmbed(fileUrl: string): MessageEmbed {
    const fields = this.stats
      .sort((a, b) => b.percent - a.percent)
      .map((stat) => ({
        name: stat.name,
        value: `\`${(stat.percent * 100).toFixed(2)}%\``,
        inline: true,
      }))
    ;

    const usageFields = [];
    // Crit
    const critStat = this.stats.find((stat) => stat.type.toLowerCase().includes('crit'));
    if (!this.isVeraPart() && critStat) {
      usageFields.push({
        name: critStat.name,
        value: `\`${(critStat.percent * 100).toFixed(2)}%\``,
        inline: true,
      });
    }
    // Rate DPS
    const hasFlatElementalStats = this.stats.some((stat) => stat.isElemental() && stat.isAttack() && stat.isFlat() && stat.percent > 0);
    if (!this.isVeraPart() && hasFlatElementalStats) {
      usageFields.push(...this.#rateDPS());
    }

    if (usageFields.length) {
      usageFields.unshift({
        name: `__${i18n[this.locale].usableFor}__`,
        value: ' ',
        inline: false,
      });
    }

    return new MessageEmbed()
      .setTitle(this.name)
      .setColor('#E58631')
      .addFields(fields)
      .addFields(usageFields)
      .setImage(fileUrl)
      .setTimestamp(Date.now())
    ;
  }
}
