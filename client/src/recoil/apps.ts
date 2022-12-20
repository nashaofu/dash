import { useCallback, useMemo } from 'react';
import { selector, useRecoilRefresher_UNSTABLE, useRecoilValueLoadable } from 'recoil';
import fetcher from '@/utils/fetcher';

export interface IApp {
  id: string
  name: string
  url: string
  icon?: string
  created_at: string
  deleted_at: string | null
}

export const appsState = selector<IApp[]>({
  key: 'appsState',
  get: async () => {
    const { data } = await fetcher.get<IApp[]>('/app/all');
    return data;
  },
});

export const useApps = () => {
  const { state, contents } = useRecoilValueLoadable(appsState);

  const refresh = useRecoilRefresher_UNSTABLE(appsState);

  const createApp = useCallback(
    async (app: Pick<IApp, 'name' | 'url' | 'icon'>) => {
      await fetcher.post('/app/create', app);
      refresh();
    },
    [refresh],
  );

  const updateApp = useCallback(
    async (app: Pick<IApp, 'id' | 'name' | 'url' | 'icon'>) => {
      await fetcher.post('/app/update', app);
      refresh();
    },
    [refresh],
  );

  const deleteApp = useCallback(
    async (id: string) => {
      await fetcher.delete(`/app/delete/${id}`);
      refresh();
    },
    [refresh],
  );

  return useMemo(
    () => ({
      apps: state === 'hasValue' ? contents : [],
      loading: state === 'loading',
      state,
      createApp,
      updateApp,
      deleteApp,
    }),
    [state, contents, createApp, updateApp, deleteApp],
  );
};
