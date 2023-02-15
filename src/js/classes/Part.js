const Stat = require('./Stat');
const Logic = require('../Logic');
const PartsData = require('../data/parts');
const i18n = require('../../i18n');

function $rateDPS(options) {
  const atkStat = this.stats.find((stat) => stat.type === 'atk');
  const getElementalRate = (elementalStat) => {
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

module.exports = class Part {
  /**
   * @constructor
   * @param {String} locale
   * @param {PartTypeEnum} type
   * @param {Stat[]} stats
   */
  constructor(locale, type, stats) {
    this.locale = locale;
    this.type = type;
    this.stats = stats;
  }

  /**
   * @return {Object}
   */
  get partInfos() {
    return PartsData[this.type];
  }

  /**
   * @return {String}
   */
  get name() {
    return i18n[this.locale].parts[this.type];
  }

  /**
   * @param {String} ocrText
   * @param {Logger} logger
   * @return {Part}
   */
  static fromOCR(ocrText, logger = console) {
    const { locale, type, stats } = Logic(logger).getPartDataFromOCR(ocrText);
    return new Part(
      locale,
      type,
      Object.keys(stats).map((statType) => new Stat(locale, statType, stats[statType])),
    );
  }

  /**
   * @return {Boolean}
   */
  isVeraPart() {
    return ['combatEngine', 'tacticsEyepiece', 'microReactor', 'exoskeleton'].includes(this.type);
  }

  rate() {
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
      toAdd.push(...$rateDPS.call(this, { lineLength: longestStatName.length }));
    }

    if (toAdd.length) {
      toAdd.unshift(separator(i18n[this.locale].usableFor));
      result.push(...toAdd);
    }

    return `${result.join('\n')}\n`;
  }
};
