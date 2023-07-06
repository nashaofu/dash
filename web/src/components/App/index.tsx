import { theme } from 'antd';
import cls from 'classnames';
import { IApp } from '@/types/app';
import AppIcon from '../AppIcon';
import styles from './index.module.less';

export interface IAppProps {
  app: IApp;
  className?: string;
  clickable?: boolean;
}

export default function App({ app, className, clickable = true }: IAppProps) {
  const { token } = theme.useToken();
  const style = {
    backgroundColor: token.colorBgContainer,
    border: `1px solid ${token.colorBgBase}`,
  };
  const body = (
    <>
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
    </>
  );

  if (clickable) {
    return (
      <a
        className={cls(styles.app, className)}
        style={style}
        href={app.url}
        title={app.name}
        target="_blank"
        rel="noreferrer"
      >
        {body}
      </a>
    );
  }

  return (
    <div className={cls(styles.app, className)} style={style} title={app.name}>
      {body}
    </div>
  );
}
