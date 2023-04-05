import {
  useCallback, useMemo, useRef, useState,
} from 'react';
import { Button, Card, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import { LogoutOutlined, PlusOutlined } from '@ant-design/icons';
import useSWRMutation from '@/hooks/useSWRMutation';
import useBoolean from '@/hooks/useBoolean';
import fetcher from '@/utils/fetcher';
import UserCreate from '@/components/UserCreate';
import MyProfile from './components/MyProfile';
import UserManage from './components/UserManage';
import styles from './index.module.less';
import useMessage from '@/hooks/useMessage';
import useUser from '@/store/user';
import { IUser } from '@/types/user';

export default function Users() {
  const navigate = useNavigate();
  const {
    data: user,
    isLoading: fetchUserInfoLoading,
    mutate: mutateUser,
  } = useUser();

  const [isOpenUserCreate, isOpenUserCreateActions] = useBoolean(false);

  const userManageRef = useRef<{ fetchUserList:() => unknown }>(null);

  const message = useMessage();

  const { isMutating: logoutLoading, trigger: logout } = useSWRMutation<void>(
    '/auth/logout',
    fetcher.post,
    {
      onSuccess: () => {
        mutateUser(undefined, { revalidate: false });
        navigate('/login');
      },
      onError: () => {
        message.error('退出登录失败');
      },
    },
  );

  const loading = fetchUserInfoLoading || logoutLoading;

  const onUserUpdate = useCallback(
    (newUser: IUser) => {
      mutateUser(newUser);
      userManageRef.current?.fetchUserList();
    },
    [mutateUser],
  );

  const tabContent = {
    MyProfile: (
      <MyProfile user={user} loading={loading} onUserUpdate={onUserUpdate} />
    ),
    UserManage: user?.is_admin && (
      <UserManage ref={userManageRef} user={user} loading={loading} />
    ),
  };
  const [activeTabKey, setActiveTabKey] = useState<keyof typeof tabContent>('MyProfile');

  const tabList = useMemo(() => {
    const items = [
      {
        key: 'MyProfile',
        tab: '我的信息',
      },
    ];

    if (user?.is_admin) {
      items.push({
        key: 'UserManage',
        tab: '用户管理',
      });
    }

    return items;
  }, [user]);

  const onTabChange = useCallback((key: string) => {
    setActiveTabKey(key as keyof typeof tabContent);
  }, []);

  const onUserCreateOk = useCallback(() => {
    isOpenUserCreateActions.setFalse();
    userManageRef.current?.fetchUserList();
  }, [isOpenUserCreateActions]);

  return (
    <div className={styles.users}>
      <Card
        className={styles.card}
        tabList={tabList}
        activeTabKey={activeTabKey}
        onTabChange={onTabChange}
        tabBarExtraContent={(
          <Space.Compact>
            {user?.is_admin && (
              <Button
                loading={loading}
                icon={<PlusOutlined />}
                title="添加用户"
                onClick={isOpenUserCreateActions.setTrue}
              />
            )}
            <Button
              loading={loading}
              icon={<LogoutOutlined />}
              title="退出登录"
              onClick={() => logout()}
            />
          </Space.Compact>
        )}
      >
        {tabContent[activeTabKey]}
      </Card>

      <UserCreate
        open={isOpenUserCreate}
        onOk={onUserCreateOk}
        onCancel={isOpenUserCreateActions.setFalse}
      />
    </div>
  );
}
