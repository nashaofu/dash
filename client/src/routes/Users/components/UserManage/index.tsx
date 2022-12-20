import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import {
  Avatar, Button, Space, Table, TableColumnsType, Tag,
} from 'antd';
import dayjs from 'dayjs';
import { useRequest } from 'ahooks';
import { get } from 'lodash-es';
import fetcher from '@/utils/fetcher';
import { IUser } from '@/types/user';
import { uriToUrl } from '@/utils/file';
import styles from './index.module.less';
import useModal from '@/hooks/useModal';
import useMessage from '@/hooks/useMessage';

interface IFetchUserListParams {
  page?: number;
  size?: number;
}

interface IFetchUserListRes {
  items: IUser[];
  total: number;
}

interface IUserManageProps {
  user?: IUser;
  loading?: boolean;
}

const defaultFetchUserListParams = {
  page: 1,
  size: 10,
};

export default forwardRef(({ user, loading }: IUserManageProps, ref) => {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const {
    data,
    loading: fetchUserListLoading,
    run: fetchUserList,
  } = useRequest(
    (params: IFetchUserListParams = defaultFetchUserListParams) => {
      setPage(params.page ?? defaultFetchUserListParams.page);
      setSize(params.size ?? defaultFetchUserListParams.size);
      return fetcher.get<unknown, IFetchUserListRes>('/user/list', { params });
    },
  );
  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const modal = useModal();
  const message = useMessage();

  useImperativeHandle(ref, () => ({
    fetchUserList,
  }));

  const { runAsync: deleteUser } = useRequest(
    (id: string) => fetcher.delete(`/user/delete/${id}`),
    {
      manual: true,
      onSuccess: () => fetchUserList(),
      onError: (err) => {
        message.error(get(err, 'response.data.message', '删除失败'));
      },
    },
  );

  const onDelete = useCallback(
    (record: IUser) => {
      modal.confirm({
        title: '删除确认',
        content: `确认删除 ${record.name} 吗？`,
        onOk: () => deleteUser(record.id),
      });
    },
    [modal, deleteUser],
  );

  const onPaginationChange = useCallback(
    (current: number, pageSize: number) => {
      fetchUserList({
        page: current,
        size: pageSize,
      });
    },
    [fetchUserList],
  );

  const columns: TableColumnsType<IUser> = useMemo(
    () => [
      {
        title: '用户名',
        dataIndex: 'name',
        key: 'name',
        width: 200,
        render: (_, record) => (
          <div className={styles.name}>
            <span>{record.name}</span>
            {record.id === user?.id && (
              <Tag className={styles.nameTag} color="blue">
                当前用户
              </Tag>
            )}
          </div>
        ),
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
        title: '删除',
        key: 'delete',
        fixed: 'right',
        width: 80,
        render: (_, record) => (
          <Space.Compact size="small" block>
            <Button
              type="link"
              disabled={!user?.is_admin || user.id === record.id}
              onClick={() => onDelete(record)}
            >
              删除
            </Button>
          </Space.Compact>
        ),
      },
    ],
    [user, onDelete],
  );

  return (
    <Table
      columns={columns}
      dataSource={items}
      loading={loading || fetchUserListLoading}
      rowKey="id"
      pagination={{
        current: page,
        pageSize: size,
        total,
        onChange: onPaginationChange,
        onShowSizeChange: onPaginationChange,
      }}
      scroll={{
        scrollToFirstRowOnChange: true,
        x: true,
        y: 'calc(100vh - 330px)',
      }}
    />
  );
});
