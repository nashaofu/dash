import useSWR, { SWRConfiguration } from 'swr';
import fetcher from '@/utils/fetcher';
import { IApp } from '@/types/app';

export default function useApps(config?: SWRConfiguration) {
  return useSWR<IApp[]>(
    '/app/all',
    async (url) => {
      const data = await fetcher.get<unknown, IApp[]>(url);
      return data.sort((a, b) => a.index - b.index);
    },
    config,
  );
}
