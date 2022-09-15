import { useEffect } from 'react';

export const useAppInit = () => {
  useEffect(() => {
    setTimeout(() => {
      document.getElementById('preload').setAttribute('data-hidden', '');
    }, 150);
  }, []);
};
