const elementalAtk = ['frostAtk', 'voltAtk', 'flameAtk', 'physicalAtk', 'alteredAtk']
  .reduce((acc, statType) => ({
    ...acc,
    [statType]: {
      initial: 69,
      min: 125,
      max: 312,
    },
  }), {})
;

const elementalAtkPercent = ['frostAtk%', 'voltAtk%', 'flameAtk%', 'physicalAtk%', 'alteredAtk%']
  .reduce((acc, statType) => ({
    ...acc,
    [statType]: {
      initial: 1.26,
      min: 1.44,
      max: 1.44,
    },
  }), {})
;

const elementalDmgBoostPercent = ['frostDmgBoost%', 'voltDmgBoost%', 'flameDmgBoost%', 'physicalDmgBoost%', 'alteredDmgBoost%']
  .reduce((acc, statType) => ({
    ...acc,
    [statType]: {
      initial: 0.65,
      min: 0.72,
      max: 0.72,
    },
  }), {})
;

const elementalRes = ['frostRes', 'voltRes', 'flameRes', 'physicalRes', 'alteredRes']
  .reduce((acc, statType) => ({
    ...acc,
    [statType]: {
      initial: 215,
      min: 390,
      max: 974,
    },
  }), {})
;

const elementalResPercent = ['frostRes%', 'voltRes%', 'flameRes%', 'physicalRes%', 'alteredRes%']
  .reduce((acc, statType) => ({
    ...acc,
    [statType]: {
      initial: 7.87,
      min: 9,
      max: 9,
    },
  }), {})
;

module.exports = {
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
  'crit%': {
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
};
