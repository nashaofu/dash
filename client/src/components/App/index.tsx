import { useMemo } from 'react';
import { Dropdown } from 'antd';
import { IApp } from '@/recoil/apps';
import { uriToUrl } from '@/utils/file';
import styles from './index.module.scss';

export interface IAppProps {
  app: IApp
  onEdit?: (app: IApp) => unknown
  onDelete?: (app: IApp) => unknown
}

export default function App({ app, onEdit, onDelete }: IAppProps) {
  const items = useMemo(
    () => [
      {
        key: 'edit',
        label: '编辑应用',
        onClick: () => {
          onEdit?.(app);
        },
      },
      {
        key: 'delete',
        label: '删除应用',
        onClick: () => {
          onDelete?.(app);
        },
      },
    ],
    [app, onEdit, onDelete],
  );

  return (
    <a className={styles.app} href={app.url} title={app.name} target="_blank" rel="noreferrer">
      <Dropdown placement="bottomRight" menu={{ items }} trigger={['click']}>
        <div className={styles.more}>
          <span className="iconfont icon-more" />
        </div>
      </Dropdown>
      <div className={styles.icon}>
        {app.icon ? (
          <img className={styles.iconImage} src={uriToUrl(app.icon)} alt={app.name} />
        ) : (
          <div className={styles.iconText}>{app.name.slice(0, 1).toUpperCase()}</div>
        )}
      </div>
      <div className={styles.name}>{app.name}</div>
    </a>
  );
}
