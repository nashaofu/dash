import { useCallback, useState } from 'react';

export default function useRequest<A = unknown, D = unknown>(request: (...args: A[]) => Promise<D>) {
  const [data, setData] = useState<D | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(undefined);

  const fetch = useCallback(
    async (...args: A[]) => {
      setLoading(true);
      try {
        const resp = await request(...args);
        setData(resp);
        return resp;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [request],
  );

  return {
    data,
    loading,
    error,
    fetch,
  };
}
