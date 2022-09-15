import { useEffect, useMemo } from 'react';
import { getTheme } from '../themes';

export const useAppTheme = () => {
  const theme = window.theme;
  const currentTheme = useMemo(() => getTheme(theme), [theme]);

  useEffect(() => {
    document.body.style.backgroundColor = currentTheme.background;
  }, [theme]);

  window.debugTheme = currentTheme;

  return currentTheme;
};
