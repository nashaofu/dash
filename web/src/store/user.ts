import useSWR, { SWRConfiguration } from 'swr';
import { IUser } from '@/types/user';
import fetcher from '@/utils/fetcher';

export default function useUser(config?: SWRConfiguration) {
  return useSWR<IUser>('/user/info', (url) => fetcher.get(url), config);
}
