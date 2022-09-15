import { setLightness, darken } from 'polished';

export const colors = {
  blue: `#1283c3`,
  green: `#008000`,
  red: `#ac3434`,
  black: `#000000`,
  white: `#ffffff`,
};

export const THEME_KEYS = {
  LIGHT: 'light',
  DARK: 'dark',
};

export const getShade = (value, baseShade, factor) => darken(factor * value, baseShade);

export const generateThemeConfig = (factor, baseShade) => {
  return {
    white: colors.white,
    black: colors.black,
    elasticBezier: `cubic-bezier(0.1, 0.71, 0.28, 1.14)`,
    borderRadius: 5,
    background: baseShade,
    text: getShade(0.9, baseShade, factor),
    getShade: (value) => getShade(value, baseShade, factor),
  };
};

export const setGreyscale = (baseShade, factor, stepCount = 30) => {
  return {
    ...Array(stepCount + 1)
      .fill(0)
      .map((i, index) => ({
        index,
        progress: index / stepCount,
      }))
      .reduce(
        (scaleCollection, scale) => ({
          ...scaleCollection,
          [`gray${scale.index}`]: getShade(scale.progress, baseShade, factor),
        }),
        {}
      ),
  };
};

export const BASE_SHADE = {
  [THEME_KEYS.LIGHT]: colors.white,
  [THEME_KEYS.DARK]: setLightness(0.2, colors.black),
};

export const FACTOR = {
  [THEME_KEYS.LIGHT]: 1,
  [THEME_KEYS.DARK]: -0.8,
};

export const THEMES = {
  [THEME_KEYS.LIGHT]: {
    name: THEME_KEYS.LIGHT,
    factor: FACTOR[THEME_KEYS.LIGHT],
    primary: colors.blue,
    secondary: colors.green,
    danger: colors.red,
    ...generateThemeConfig(FACTOR[THEME_KEYS.LIGHT], BASE_SHADE[THEME_KEYS.LIGHT]),
    grayScale: setGreyscale(BASE_SHADE[THEME_KEYS.LIGHT], 1),
    base: BASE_SHADE[THEME_KEYS.LIGHT],
  },
  [THEME_KEYS.DARK]: {
    name: THEME_KEYS.DARK,
    factor: FACTOR[THEME_KEYS.DARK],
    primary: colors.blue,
    secondary: colors.green,
    danger: colors.red,
    ...generateThemeConfig(FACTOR[THEME_KEYS.DARK], BASE_SHADE[THEME_KEYS.DARK]),
    grayScale: setGreyscale(BASE_SHADE[THEME_KEYS.DARK], FACTOR[THEME_KEYS.DARK]),
    base: setLightness(0.2, BASE_SHADE[THEME_KEYS.DARK]),
  },
};

console.log('[DEVTOOL]', THEMES);

export const getTheme = (key) => THEMES[key] || THEMES[THEME_KEYS.LIGHT];
