import {
  CancelOptions,
  InvalidateOptions,
  SetDataOptions,
  Updater,
  UseQueryOptions,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import fetcher from '@/utils/fetcher';
import { IApp } from '@/types/app';

type IUseQueryOptions = UseQueryOptions<IApp[], unknown, IApp[], string[]>;

type IUseAppsOptions = Omit<IUseQueryOptions, 'queryKey' | 'queryFn'>;

const queryKey = ['/app/all'];

export default function useApps(options?: IUseAppsOptions) {
  const queryClient = useQueryClient();

  const query = useQuery({
    ...options,
    queryKey,
    queryFn: async () => {
      const apps = await fetcher.get<unknown, IApp[]>('/app/all');
      return apps.sort((a, b) => a.index - b.index);
    },
  });

  const cancelQuery = useCallback(
    (opts?: CancelOptions) => queryClient.cancelQueries({ queryKey, exact: false }, opts),
    [queryClient],
  );
  const getQueryData = useCallback(
    () => queryClient.getQueryData<IApp[]>(queryKey),
    [queryClient],
  );
  const setQueryData = useCallback(
    (
      updater: Updater<IApp[] | undefined, IApp[] | undefined>,
      opts?: SetDataOptions,
    ) => queryClient.setQueryData(queryKey, updater, opts),
    [queryClient],
  );
  const invalidateQueries = useCallback(
    (opts?: InvalidateOptions) => queryClient.invalidateQueries({ queryKey }, opts),
    [queryClient],
  );

  return useMemo(
    () => ({
      ...query,
      cancelQuery,
      getQueryData,
      setQueryData,
      invalidateQueries,
    }),
    [query, cancelQuery, getQueryData, setQueryData, invalidateQueries],
  );
}
