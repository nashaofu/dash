import { useLocalStorageState, useRequest } from 'ahooks';
import { useMemo } from 'react';
import fetcher from '@/utils/fetcher';
import { ISetting } from '@/types/setting';

type IUseRequest = typeof useRequest<ISetting, unknown[]>;

type IUseRequestOptions = Exclude<Parameters<IUseRequest>[1], undefined>;

type IOptions = Omit<IUseRequestOptions, 'cacheKey' | 'setCache' | 'getCache'>;
type ICachedData = Parameters<
Exclude<IUseRequestOptions['setCache'], undefined>
>[0];

export default function useSetting(options?: IOptions) {
  const [storage, setStorage] = useLocalStorageState<ICachedData | undefined>(
    'Dash.setting',
  );

  const result = useRequest(
    () => fetcher.get<unknown, ISetting>('/setting/get'),
    {
      ...options,
      cacheKey: 'setting',
      setCache: (data) => setStorage(data),
      getCache: () => storage,
    },
  );

  return useMemo(
    () => ({
      ...result,
      clear: () => {
        result.mutate(undefined);
        setStorage(undefined);
      },
    }),
    [result, setStorage],
  );
}
