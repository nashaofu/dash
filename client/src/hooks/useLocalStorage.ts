import { useMemo } from 'react';

export default function useLocalStorage(key: string) {
  const innerKey = `WeGo.${key}`;

  return useMemo(
    () => ({
      get: () => {
        const str = localStorage.getItem(innerKey);
        try {
          return str ? JSON.parse(str) : undefined;
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error(err);
          return undefined;
        }
      },
      set: (val: unknown = '') => {
        try {
          const str = JSON.stringify(val);
          localStorage.setItem(innerKey, str);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error(err);
        }
      },
      remove: () => {
        localStorage.removeItem(innerKey);
      },
    }),
    [innerKey],
  );
}
