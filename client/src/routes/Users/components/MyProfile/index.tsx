import { useCallback, useMemo } from 'react';
import {
  Avatar, Button, Space, Table, TableColumnsType,
} from 'antd';
import dayjs from 'dayjs';
import { useBoolean } from 'ahooks';
import UserUpdate from '@/components/UserUpdate';
import PasswordUpdate from '@/components/PasswordUpdate';
import { IUser } from '@/types/user';
import { uriToUrl } from '@/utils/file';
import styles from './index.module.less';

interface IMyProfileProps {
  user?: IUser;
  loading?: boolean;
  onUserUpdate: () => unknown;
}

export default function MyProfile({
  user,
  loading,
  onUserUpdate,
}: IMyProfileProps) {
  const data = user ? [user] : [];

  const [isOpenUserUpdate, isOpenUserUpdateActions] = useBoolean(false);
  const [isOpenPasswordUpdate, isOpenPasswordUpdateActions] = useBoolean(false);

  const onUserUpdateOk = useCallback(() => {
    isOpenUserUpdateActions.setFalse();
    onUserUpdate();
  }, [isOpenUserUpdateActions, onUserUpdate]);

  const columns: TableColumnsType<IUser> = useMemo(
    () => [
      {
        title: '用户名',
        dataIndex: 'name',
        key: 'name',
        width: 200,
        render: (_, record) => <div className={styles.name}>{record.name}</div>,
      },
      {
        title: '邮箱',
        dataIndex: 'email',
        key: 'email',
      },
      {
        title: '用户头像',
        dataIndex: 'avatar',
        key: 'avatar',
        width: 100,
        render: (_, record) => {
          const avatar = record?.avatar ? uriToUrl(record.avatar) : undefined;
          const name = record?.name?.slice(0, 1).toUpperCase();
          return (
            <Avatar size={64} src={avatar} alt="用户头像" draggable={false}>
              {name}
            </Avatar>
          );
        },
      },
      {
        title: '创建时间',
        key: 'created_at',
        width: 170,
        ellipsis: true,
        render: (_, record) => dayjs(record.created_at).format('YYYY-MM-DD HH:mm:ss'),
      },
      {
        title: '操作',
        key: 'operation',
        fixed: 'right',
        width: 120,
        render: () => (
          <Space.Compact size="small" block>
            <Button type="link" onClick={isOpenUserUpdateActions.setTrue}>
              账号设置
            </Button>
            <Button type="link" onClick={isOpenPasswordUpdateActions.setTrue}>
              密码设置
            </Button>
          </Space.Compact>
        ),
      },
    ],
    [isOpenUserUpdateActions, isOpenPasswordUpdateActions],
  );

  return (
    <>
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="id"
        pagination={false}
        scroll={{
          x: true,
        }}
      />
      <UserUpdate
        user={user}
        open={isOpenUserUpdate}
        onOk={onUserUpdateOk}
        onCancel={isOpenUserUpdateActions.setFalse}
      />
      <PasswordUpdate
        open={isOpenPasswordUpdate}
        onOk={isOpenPasswordUpdateActions.setFalse}
        onCancel={isOpenPasswordUpdateActions.setFalse}
      />
    </>
  );
}
