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

export const utils = (theme, baseShade) => {
  const isDarkTheme = theme === THEME_KEYS.DARK;
  const getShade = value => (isDarkTheme ? lighten : darken)(value, baseShade);
  return {
    white: colors.white,
    black: colors.black,
    background: baseShade,
    text: getShade(0.9),
    buttonBorderRadius: 3,
    getShade,
  }
};

export const THEMES = {
  [THEME_KEYS.LIGHT]: {
    name: THEME_KEYS.LIGHT,
    factor: 1,
    primary: colors.blue,
    secondary: colors.green,
    danger: colors.red,
    ...utils(THEME_KEYS.LIGHT, colors.white),
  },
  [THEME_KEYS.DARK]: {
    name: THEME_KEYS.DARK,
    factor: -1,
    primary: colors.blue,
    secondary: colors.green,
    danger: colors.red,
    ...utils(THEME_KEYS.DARK, setLightness(0.2, colors.black)),
  },
};

window.setLightness = setLightness;

export const getTheme = key => THEMES[key] || THEMES[THEME_KEYS.LIGHT];
