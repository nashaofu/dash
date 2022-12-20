import { theme } from 'antd';
import { IApp } from '@/types/app';
import AppIcon from '../AppIcon';
import styles from './index.module.less';

export interface IAppProps {
  app: IApp;
}

export default function App({ app }: IAppProps) {
  const { token } = theme.useToken();

  return (
    <a
      href={app.url}
      title={app.name}
      className={styles.app}
      target="_blank"
      rel="noreferrer"
      style={{
        backgroundColor: token.colorBgContainer,
        border: `1px solid ${token.colorBgBase}`,
      }}
    >
      <div className={styles.icon}>
        <AppIcon app={app} />
      </div>
      <div className={styles.body}>
        <div
          className={styles.name}
          style={{
            color: token.colorText,
          }}
        >
          {app.name}
        </div>
        <div
          className={styles.description}
          style={{
            color: token.colorTextDescription,
          }}
        >
          {app.description}
        </div>
      </div>
    </a>
  );
}
