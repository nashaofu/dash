/* eslint-disable jsx-a11y/no-static-element-interactions */
import { useCallback, useMemo, useState } from 'react';
import {
  Avatar, Button, Popover, Space,
} from 'antd';
import { useRecoilRefresher_UNSTABLE, useRecoilValueLoadable } from 'recoil';
import useRequest from '@/hooks/useRequest';
import fetcher from '@/utils/fetcher';
import { userState } from '@/recoil/user';
import UserCreate from '@/components/UserCreate';
import PasswordUpdate from '@/components/PasswordUpdate';
import UserUpdate from '@/components/UserUpdate';
import { uriToUrl } from '@/utils/file';
import styles from './index.module.scss';

export default function User() {
  const loadable = useRecoilValueLoadable(userState);
  const refresh = useRecoilRefresher_UNSTABLE(userState);
  const { fetch } = useRequest(() => fetcher.post('/auth/logout'));
  const user = loadable.valueMaybe();
  const avatar = useMemo(() => (user?.avatar ? uriToUrl(user.avatar) : undefined), [user]);
  const name = useMemo(() => user?.name?.slice(0, 1).toUpperCase(), [user]);

  const [openUserPopover, setOpenUserPopover] = useState(false);

  const [openUserCreate, setOpenUserCreate] = useState(false);
  const [openUserUpdate, setOpenUserUpdate] = useState(false);
  const [openPasswordUpdate, setPasswordUpdate] = useState(false);

  const onUserPopoverOpenChange = useCallback((newOpen: boolean) => {
    setOpenUserPopover(newOpen);
  }, []);

  const onLogout = useCallback(async () => {
    await fetch();
    refresh();
  }, [fetch, refresh]);

  const onUserCreate = useCallback(() => {
    setOpenUserPopover(false);
    setOpenUserCreate(true);
  }, []);

  const onUserUpdate = useCallback(() => {
    setOpenUserPopover(false);
    setOpenUserUpdate(true);
  }, []);

  const onUserUpdateOk = useCallback(() => {
    setOpenUserUpdate(false);
    window.location.reload();
  }, []);

  const onPasswordUpdate = useCallback(() => {
    setOpenUserPopover(false);
    setPasswordUpdate(true);
  }, []);

  const menus = useMemo(
    () => [
      {
        key: 'create',
        label: '添加账号',
        isShow: user?.is_admin,
        onClick: onUserCreate,
      },
      // {
      //   key: 'lock',
      //   label: '屏幕锁定',
      //   onClick: () => {},
      // },
      {
        key: 'logout',
        label: '退出登录',
        isShow: true,
        onClick: onLogout,
      },
    ].filter((item) => item.isShow),
    [user, onUserCreate, onLogout],
  );

  return (
    <>
      <Popover
        open={openUserPopover}
        placement="bottomRight"
        trigger="click"
        overlayClassName={styles.overlay}
        showArrow={false}
        onOpenChange={onUserPopoverOpenChange}
        content={(
          <div className={styles.content}>
            <div className={styles.contentAvatar}>
              <Avatar size={80} src={avatar} alt="头像" draggable={false}>
                {name}
              </Avatar>
            </div>
            <div className={styles.name}>{user?.name}</div>
            <div className={styles.email}>{user?.email}</div>
            <div className={styles.setting}>
              <Space.Compact>
                <Button type="default" onClick={onUserUpdate}>
                  账号设置
                </Button>
                <Button type="default" onClick={onPasswordUpdate}>
                  密码设置
                </Button>
              </Space.Compact>
            </div>
            {menus.map((item) => (
              <div key={item.key} className={styles.menu} onClick={item.onClick}>
                {item.label}
              </div>
            ))}
          </div>
        )}
      >
        <div className={styles.avatar}>
          <Avatar size={32} src={avatar} alt="头像" draggable={false}>
            {name}
          </Avatar>
        </div>
      </Popover>
      <UserCreate
        open={openUserCreate}
        onOk={() => setOpenUserCreate(false)}
        onCancel={() => setOpenUserCreate(false)}
      />
      <UserUpdate user={user} open={openUserUpdate} onOk={onUserUpdateOk} onCancel={() => setOpenUserUpdate(false)} />
      <PasswordUpdate
        open={openPasswordUpdate}
        onOk={() => setPasswordUpdate(false)}
        onCancel={() => setPasswordUpdate(false)}
      />
    </>
  );
}
