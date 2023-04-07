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
import { IUser } from '@/types/user';
import fetcher from '@/utils/fetcher';

type IUseQueryOptions = UseQueryOptions<IUser, unknown, IUser, string[]>;

type IUseUserOptions = Omit<IUseQueryOptions, 'queryKey' | 'queryFn'>;

const queryKey = ['/user/info'];

export default function useUser(options?: IUseUserOptions) {
  const queryClient = useQueryClient();

  const query = useQuery({
    ...options,
    queryKey,
    queryFn: () => fetcher.get<unknown, IUser>('/user/info'),
  });

  const cancelQuery = useCallback(
    (opts?: CancelOptions) => queryClient.cancelQueries({ queryKey, exact: false }, opts),
    [queryClient],
  );
  const getQueryData = useCallback(
    () => queryClient.getQueryData<IUser>(queryKey),
    [queryClient],
  );
  const setQueryData = useCallback(
    (
      updater: Updater<IUser | undefined, IUser | undefined>,
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
