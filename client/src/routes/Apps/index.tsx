import { useCallback, useMemo, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { theme, Spin } from 'antd';
import useSWRMutation from 'swr/mutation';
import useBoolean from '@/hooks/useBoolean';
import AppEdit, { IAppEditData } from '@/components/AppEdit';
import fetcher from '@/utils/fetcher';
import { IApp } from '@/types/app';
import useModal from '@/hooks/useModal';
import useMessage from '@/hooks/useMessage';
import useApps from '@/store/apps';
import EditableApp from './components/EditableApp';
import styles from './index.module.less';

type ICreateAppData = IAppEditData;
type IUpdateAppData = IAppEditData & { id: string };

export default function Apps() {
  const {
    data: apps = [],
    isLoading: fetchAppsLoading,
    mutate: mutateApps,
  } = useApps();

  const modal = useModal();
  const message = useMessage();
  const { token } = theme.useToken();
  const pointerSensor = useSensor(PointerSensor);
  const keyboardSensor = useSensor(KeyboardSensor);
  const touchSensor = useSensor(TouchSensor);
  const sensors = useSensors(pointerSensor, touchSensor, keyboardSensor);

  const appIds = useMemo(() => apps.map((item) => item.id), [apps]);

  const [isOpenAppEdit, isOpenAppEditActions] = useBoolean(false);
  const [currentApp, setCurrentApp] = useState<IApp | null>(null);

  const { trigger: sortApp } = useSWRMutation(
    '/app/all',
    async (url, { arg }: { arg: IApp[] }) => {
      await fetcher.put(
        'app/sort',
        arg.map((item) => ({ id: item.id })),
      );
      return arg;
    },
  );

  const { isMutating: createAppLoading, trigger: createApp } = useSWRMutation(
    '/app/create',
    (url, { arg }: { arg: ICreateAppData }) => fetcher.post<unknown, IApp>(url, arg),
    {
      onSuccess: (app) => mutateApps([...apps, app]),
    },
  );

  const { trigger: deleteApp } = useSWRMutation(
    '/app/delete',
    async (url, { arg }: { arg: string }) => {
      await fetcher.delete(`${url}/${arg}`);
      return arg;
    },
    {
      onSuccess: (appId) => {
        mutateApps(apps?.filter((item) => item.id !== appId));
      },
    },
  );

  const { isMutating: updateAppLoading, trigger: updateApp } = useSWRMutation(
    '/app/update',
    (url, { arg }: { arg: IUpdateAppData }) => fetcher.put<unknown, IApp>(url, arg),
    {
      onSuccess: (app) => {
        const index = apps.findIndex((item) => item.id === app.id);
        if (index === -1) {
          return;
        }
        const newApps = [...apps];
        newApps[index] = app;
        mutateApps(newApps);
      },
    },
  );

  const onDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      if (!over || active.id === over.id) {
        return;
      }

      const oldIndex = appIds.indexOf(active.id as string);
      const newIndex = appIds.indexOf(over.id as string);
      const newApps = arrayMove(apps, oldIndex, newIndex);
      sortApp(newApps, {
        optimisticData: newApps,
        rollbackOnError: true,
      });
    },
    [appIds, apps, sortApp],
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

  return (
    <DndContext
      sensors={sensors}
      modifiers={[restrictToWindowEdges]}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <Spin spinning={fetchAppsLoading} size="large">
        <div className={styles.apps}>
          <div className={styles.container}>
            <SortableContext items={appIds}>
              {apps.map((item) => (
                <div key={item.id} className={styles.app}>
                  <EditableApp
                    id={item.id}
                    app={item}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                </div>
              ))}
              <div className={styles.add}>
                <div
                  className={styles.addBtn}
                  style={{
                    backgroundColor: token.colorBgContainer,
                    border: `1px solid ${token.colorBgBase}`,
                  }}
                  onClick={isOpenAppEditActions.setTrue}
                  role="button"
                  tabIndex="0"
                >
                  <PlusOutlined size={26} />
                  <span>添加应用</span>
                </div>
              </div>
            </SortableContext>
          </div>
        </div>
      </Spin>
      <AppEdit
        open={isOpenAppEdit}
        app={currentApp}
        loading={createAppLoading || updateAppLoading}
        onOk={onEditOk}
        onCancel={onEditCancel}
      />
    </DndContext>
  );
}
