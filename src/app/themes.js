import { setLightness, lighten, darken } from 'polished';

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

export const getShade = (value, baseShade, factor) => (factor > 0 ? darken : lighten)(value, baseShade);

export const utils = (theme, baseShade) => {
  const factor = theme === THEME_KEYS.DARK ? -1 : 1;
  return {
    white: colors.white,
    black: colors.black,
    background: baseShade,
    text: getShade(0.9, baseShade, factor),
    buttonBorderRadius: 3,
    getShade: value => getShade(value, baseShade, factor),
  };
};

export const setGreyscale = (baseShade, factor, stepCount = 30) => {
  return {
    ...Array(stepCount + 1)
      .fill(0)
      .map((i, index) => ({
        index,
        progress: (factor > 0 ? stepCount - index : index) / stepCount,
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

export const THEMES = {
  [THEME_KEYS.LIGHT]: {
    name: THEME_KEYS.LIGHT,
    factor: 1,
    primary: colors.blue,
    secondary: colors.green,
    danger: colors.red,
    ...utils(THEME_KEYS.LIGHT, BASE_SHADE[THEME_KEYS.LIGHT]),
    grayScale: setGreyscale(BASE_SHADE[THEME_KEYS.LIGHT], 1),
    base: BASE_SHADE[THEME_KEYS.LIGHT],
  },
  [THEME_KEYS.DARK]: {
    name: THEME_KEYS.DARK,
    factor: -1,
    primary: colors.blue,
    secondary: colors.green,
    danger: colors.red,
    ...utils(THEME_KEYS.DARK, BASE_SHADE[THEME_KEYS.DARK]),
    grayScale: setGreyscale(BASE_SHADE[THEME_KEYS.DARK], -1),
    base: setLightness(0.2, BASE_SHADE[THEME_KEYS.DARK]),
  },
};

export const getTheme = key => THEMES[key] || THEMES[THEME_KEYS.LIGHT];
