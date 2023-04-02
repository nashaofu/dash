import { Spin } from 'antd';
import App from '@/components/App';
import styles from './index.module.less';
import useApps from '@/store/apps';

export default function Home() {
  const { data: apps = [], isLoading } = useApps();

  return (
    <Spin spinning={isLoading}>
      <div className={styles.home}>
        <div className={styles.container}>
          {apps.map((item) => (
            <div className={styles.app} key={item.id}>
              <App app={item} className={styles.appItem} />
            </div>
          ))}
        </div>
      </div>
    </Spin>
  );
}
