const StatsData = require('../data/stats');
const i18n = require('../../i18n');

module.exports = class Stat {
  /**
   * @constructor
   * @param {String} locale
   * @param {String} type
   * @param {Number} value
   */
  constructor(locale, type, value) {
    this.locale = locale;
    this.type = type;
    this.value = value;
  }

  /**
   * @return {Object}
   */
  get statInfos() {
    return StatsData[this.type];
  }

  /**
   * @return {Number}
   */
  get percent() {
    const { initial, max } = this.statInfos;
    return (this.value - initial) / (max * 5);
  }

  /**
   * @return {String}
   */
  get name() {
    const [name] = i18n[this.locale].stats[this.type.replace('%', '')];
    return name;
  }

  /**
   * @return {String}
   */
  get dpsName() {
    return i18n[this.locale].dpsTypes?.[this.type.replace(/^([a-z]+).*$/, '$1')] ?? '';
  }

  /**
   * @return {Boolean}
   */
  isElemental() {
    return ['frost', 'flame', 'volt', 'physical', 'altered']
      .some((statType) => this.type.startsWith(statType))
    ;
  }

  /**
   * @return {Boolean}
   */
  isAttack() {
    return this.type.toLowerCase().includes('atk');
  }

  /**
   * @return {Boolean}
   */
  isResistance() {
    return this.type.toLowerCase().includes('res');
  }

  /**
   * @return {Boolean}
   */
  isDamageBoost() {
    return this.type.toLowerCase().includes('dmgboost');
  }

  /**
   * @return {Boolean}
   */
  isPercent() {
    return this.type.endsWith('%');
  }

  /**
   * @return {Boolean}
   */
  isFlat() {
    return !this.type.endsWith('%');
  }
};
