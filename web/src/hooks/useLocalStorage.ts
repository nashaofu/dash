import { useCallback, useState } from 'react';

function getLocalStorage<T>(key: string): T | undefined {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      return JSON.parse(raw) as T;
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  return undefined;
}

export default function useLocalStorage<T>(
  key: string,
): [T | undefined, (val: T | undefined) => void] {
  const localStorageKey = `Dash.${key}`;

  const [state, setState] = useState(() => getLocalStorage<T>(localStorageKey));

  const setLocalStorage = useCallback(
    (value: T | undefined) => {
      setState(value);

      if (value === undefined) {
        localStorage.removeItem(localStorageKey);
      } else {
        try {
          localStorage.setItem(localStorageKey, JSON.stringify(value));
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error(err);
        }
      }
    },
    [localStorageKey],
  );

  return [state, setLocalStorage];
}
