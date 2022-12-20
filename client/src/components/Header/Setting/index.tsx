import { Dropdown } from 'antd';
import { useCallback, useMemo, useState } from 'react';
import AppEdit, { IAppEditData } from '@/components/AppEdit';
import { useApps } from '@/recoil/apps';
import styles from './index.module.scss';

export default function Setting() {
  const apps = useApps();
  const [open, setOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  const items = useMemo(
    () => [
      {
        key: 'create',
        label: '添加应用',
        onClick: () => {
          setOpen(true);
        },
      },
      {
        key: 'wallpaper',
        label: '壁纸设置',
        onClick: () => {},
      },
    ],
    [],
  );

  const onAppEditOk = useCallback(
    async (app: IAppEditData) => {
      setCreateLoading(true);
      try {
        await apps.createApp(app);
        setOpen(false);
      } finally {
        setCreateLoading(false);
      }
    },
    [apps],
  );

  const onAppEditCancel = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <>
      <Dropdown placement="bottomLeft" menu={{ items }} trigger={['click']}>
        <div className={styles.setting}>
          <span className="iconfont icon-apps" />
        </div>
      </Dropdown>
      <AppEdit open={open} loading={createLoading} onOk={onAppEditOk} onCancel={onAppEditCancel} />
    </>
  );
}
