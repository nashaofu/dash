import { useRequest } from 'ahooks';
import App from '@/components/App';
import styles from './index.module.less';
import fetcher from '@/utils/fetcher';
import { IApp } from '@/types/app';

export default function Home() {
  const { data: apps = [] } = useRequest(() => fetcher.get<unknown, IApp[]>('/app/all'));

  return (
    <div className={styles.home}>
      <div className={styles.container}>
        {apps.map((item) => (
          <div className={styles.app} key={item.id}>
            <App app={item} />
          </div>
        ))}
      </div>
    </div>
  );
}
