import * as Diff from 'diff';
import i18n from '@/i18n';
import type { ILogger, OCRPartData } from '@/js/types';
import type { PartTypeEnum, StatTypeEnum } from '@/js/types/enums';

export default class Logic {
  constructor(public logger: ILogger, public userLocale?: string | undefined) {}

  normalize(str: string): string {
    return str
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
    ;
  }

  getLinesFromOCR(ocrText: string): string[] {
    const partRegex = /^([A-Za-z -]+)(?:[0-9]+)?.*$/;
    const statRegex = /^(?:.{0,4} )?([A-Za-z ]+\+[0-9,.]+%?).*$/;
    const lines = this.normalize(ocrText)
      .split('\n')
      .filter((line) => line.length > 0 && !/^\s+$/.test(line))
      .filter((line, i) => i === 0 || statRegex.test(line))
      .map((line) => {
        if (statRegex.test(line)) {
          return line.replace(statRegex, '$1').trim();
        }
        if (partRegex.test(line)) {
          return line.replace(partRegex, '$1').trim();
        }
        return line;
      })
    ;

    if (lines.length < 5) {
      this.logger.log('error', 'Invalid data');
      throw new Error('Invalid data');
    }

    const [partLine, ...statLines] = lines;
    return [partLine, ...statLines.slice(-4)];
  }

  getPartType(line: string, locale: string): PartTypeEnum | undefined {
    const dataset = i18n[locale].parts;
    const getBestDiffList = (partType: PartTypeEnum): Diff.Change | undefined => Diff
      .diffWords(this.normalize(dataset[partType]), this.normalize(line.replace(/^([A-Za-z -]+)(?:[0-9]+)?.*$/, '$1').trim()))
      .find((diff, i, arr) => diff.count === Math.max(...arr.map((t) => t.count ?? 0)))
    ;
    const [bestDiff] = Object
      .keys(dataset)
      .map((partType) => getBestDiffList(partType as PartTypeEnum))
      .sort(
        (a, b) => (b?.count ?? 0) - (a?.count ?? 0)
              || (b?.value.length ?? 0) - (a?.value.length ?? 0)
              || (b?.value.localeCompare(a?.value ?? '') ?? 0),
      )
    ;

    return Object
      .keys(dataset)
      .find((partType) => this.normalize(dataset[partType as PartTypeEnum]).includes(bestDiff?.value ?? '')) as (PartTypeEnum | undefined)
    ;
  }

  getStatType(line: string, locale: string): StatTypeEnum | undefined {
    const dataset = i18n[locale].stats;

    const getBestDiffList = (statText: string): Diff.Change | undefined => Diff
      .diffWords(this.normalize(statText), this.normalize(line.replace(/^([A-Za-z ]+)\+[0-9,.]+%?.*$/, '$1').trim()))
      .filter((diff) => !diff.added && !diff.removed)
      .find((diff, i, arr) => diff.count === Math.max(...arr.map((t) => t.count ?? 0)))
    ;

    const [bestDiff] = Object
      .keys(dataset)
      .map((statType) => dataset[statType as StatTypeEnum].reduce((acc: Diff.Change[], statText: string) => {
        const diffList = getBestDiffList(statText);
        return diffList ? [...acc, diffList] : acc;
      }, []))
      .flat()
      .sort(
        (a, b) => (b?.count ?? 0) - (a?.count ?? 0)
               || (b?.value.length ?? 0) - (a?.value.length ?? 0)
               || (b?.value.localeCompare(a?.value ?? '') ?? 0),
      )
    ;

    return Object
      .keys(dataset)
      .find((statType) => dataset[statType as StatTypeEnum]
        .map((t) => this.normalize(t))
        .includes(bestDiff?.value.trim())) as (StatTypeEnum | undefined)
    ;
  }

  getLocale(line: string): string | undefined {
    return Object
      .keys(i18n)
      .find((locale) => this.getPartType(line, locale))
    ;
  }

  parseValue(locale: string, value: string): number {
    const { thousandSeparator, decimalSeparator } = i18n[locale].numberFormat;
    return parseFloat(value.replace(thousandSeparator, '').replace(decimalSeparator, '.'));
  }

  getPartDataFromOCR(ocrText: string): OCRPartData {
    const [line, ...statLines] = this.getLinesFromOCR(ocrText);
    let locale: string | undefined;
    let partType: PartTypeEnum | undefined;

    if (this.userLocale) {
      locale = this.userLocale;
    } else {
      try {
        locale = this.getLocale(line);
        if (!locale) throw new Error('No locale found');
      } catch (e) {
        this.logger.log('error', 'I do not recognize the language in which the text is written, I only support English and French', line, e);
        throw new Error('I do not recognize the language in which the text is written, I only support English and French');
      }
    }

    try {
      console.log(line, locale);
      partType = this.getPartType(line, locale);
      if (!partType) throw new Error('No partType found');
    } catch (e) {
      this.logger.log('error', 'I do not recognize your equipment part, try with a larger screenshot or change the game resolution to 1980x1080.', line, e);
      throw new Error('I do not recognize your equipment part, try with a larger screenshot or change the game resolution to 1980x1080');
    }

    return {
      locale,
      type: partType,
      stats: statLines.reduce((acc, statLine) => {
        try {
          const statType = this.getStatType(statLine, locale as string);
          const [, value, percent] = /^[^0-9,.]*([0-9,.]+)(%?)$/.exec(statLine) ?? [];
          return {
            ...acc,
            [`${statType}${percent ? '%' : ''}`]: this.parseValue(locale as string, value),
          };
        } catch (e) {
          this.logger.log('error', `I do not recognize the statistic in "${line}", contact the developer so that he can remedy this.`, e);
          throw new Error(`I do not recognize the statistic in "${line}", contact the developer so that he can remedy this.`);
        }
      }, {}),
    };
  }
}
