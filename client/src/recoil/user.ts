import { selector } from 'recoil';
import fetcher from '@/utils/fetcher';

export interface IUser {
  id: string
  name: string
  email: string
  avatar?: string
  is_admin: boolean
  created_at: string
  deleted_at: string | null
}

export const userState = selector<IUser>({
  key: 'userState',
  get: async () => {
    const { data } = await fetcher.get<IUser>('/user/info');
    return data;
  },
});
