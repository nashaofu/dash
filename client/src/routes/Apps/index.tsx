import {
  Button, Card, Space, Table, TableColumnsType,
} from 'antd';
import { useCallback, useMemo, useState } from 'react';
import { useRequest, useBoolean } from 'ahooks';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import AppEdit, { IAppEditData } from '@/components/AppEdit';
import styles from './index.module.less';
import fetcher from '@/utils/fetcher';
import { IApp } from '@/types/app';
import useModal from '@/hooks/useModal';
import useMessage from '@/hooks/useMessage';
import AppIcon from '@/components/AppIcon';

export default function Apps() {
  const {
    data: apps = [],
    loading: fetchAllAppLoading,
    refresh,
  } = useRequest(() => fetcher.get<unknown, IApp[]>('/app/all'));

  const modal = useModal();
  const message = useMessage();

  const [isOpenAppEdit, isOpenAppEditActions] = useBoolean(false);
  const [currentApp, setCurrentApp] = useState<IApp | null>(null);

  const { runAsync: createApp, loading: createLoading } = useRequest(
    (data: IAppEditData) => fetcher.post('/app/create', data),
    {
      manual: true,
      onFinally: () => refresh(),
    },
  );
  const { runAsync: deleteApp } = useRequest(
    (id: string) => fetcher.delete(`/app/delete/${id}`),
    {
      manual: true,
      onFinally: () => refresh(),
    },
  );
  const { runAsync: updateApp, loading: updateAppLoading } = useRequest(
    (data: IAppEditData & { id: string }) => fetcher.put('/app/update', data),
    {
      manual: true,
      onFinally: () => refresh(),
    },
  );

  const onEdit = useCallback(
    (app: IApp) => {
      isOpenAppEditActions.setTrue();
      setCurrentApp(app);
    },
    [isOpenAppEditActions],
  );

  const onDelete = useCallback(
    (record: IApp) => {
      modal.confirm({
        title: '删除确认',
        content: `确认删除 ${record.name} 吗？`,
        onOk: () => deleteApp(record.id),
      });
    },
    [modal, deleteApp],
  );

  const onEditOk = useCallback(
    async (data: IAppEditData) => {
      try {
        if (currentApp) {
          await updateApp({
            ...data,
            id: currentApp.id,
          });
          message.success('编辑成功');
        } else {
          await createApp(data);
          message.success('创建成功');
        }
        isOpenAppEditActions.setFalse();
        setCurrentApp(null);
      } catch (err) {
        message.error(currentApp ? '编辑失败' : '创建失败');
      }
    },
    [currentApp, message, isOpenAppEditActions, updateApp, createApp],
  );

  const onEditCancel = useCallback(() => {
    isOpenAppEditActions.setFalse();
    setCurrentApp(null);
  }, [isOpenAppEditActions]);

  const columns: TableColumnsType<IApp> = useMemo(
    () => [
      {
        title: '应用 URL',
        dataIndex: 'url',
        key: 'url',
        render: (_, record) => <div className={styles.url}>{record.name}</div>,
      },
      {
        title: '应用名称',
        dataIndex: 'name',
        key: 'name',
        width: 230,
      },
      {
        title: '应用描述',
        dataIndex: 'description',
        key: 'description',
        render: (_, record) => (
          <div className={styles.description}>{record.description || '-'}</div>
        ),
      },
      {
        title: '应用图标',
        dataIndex: 'icon',
        key: 'icon',
        width: 90,
        render: (_, record) => <AppIcon app={record} />,
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
        render: (_, record) => (
          <Space.Compact size="small" block>
            <Button type="link" onClick={() => onEdit(record)}>
              编辑
            </Button>
            <Button type="link" onClick={() => onDelete(record)}>
              删除
            </Button>
          </Space.Compact>
        ),
      },
    ],
    [onEdit, onDelete],
  );

  return (
    <div className={styles.apps}>
      <Card
        title="应用管理"
        className={styles.card}
        extra={(
          <Button
            icon={<PlusOutlined />}
            loading={fetchAllAppLoading}
            onClick={isOpenAppEditActions.setTrue}
            title="添加应用"
          />
        )}
      >
        <Table
          columns={columns}
          dataSource={apps}
          rowKey="id"
          loading={fetchAllAppLoading}
          pagination={false}
          scroll={{
            scrollToFirstRowOnChange: true,
            x: true,
            y: 'calc(100vh - 270px)',
          }}
        />
      </Card>
      <AppEdit
        open={isOpenAppEdit}
        app={currentApp}
        loading={createLoading || updateAppLoading}
        onOk={onEditOk}
        onCancel={onEditCancel}
      />
    </div>
  );
}
