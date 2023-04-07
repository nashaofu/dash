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
import { Spin } from 'antd';
import { useMutation } from '@tanstack/react-query';
import useBoolean from '@/hooks/useBoolean';
import AppEdit, { IAppEditData } from '@/components/AppEdit';
import fetcher from '@/utils/fetcher';
import { IApp } from '@/types/app';
import useModal from '@/hooks/useModal';
import useMessage from '@/hooks/useMessage';
import EditableApp from './components/EditableApp';
import styles from './index.module.less';
import useApps from '@/queries/apps';

type ICreateAppData = IAppEditData;
type IUpdateAppData = IAppEditData & { id: string };

export default function Apps() {
  const {
    data: apps = [],
    isInitialLoading: fetchAppsLoading,
    refetch: refetchApps,
    cancelQuery,
    getQueryData,
    setQueryData,
  } = useApps({
    refetchOnWindowFocus: false,
  });

  const modal = useModal();
  const message = useMessage();
  const pointerSensor = useSensor(PointerSensor);
  const keyboardSensor = useSensor(KeyboardSensor);
  const touchSensor = useSensor(TouchSensor);
  const sensors = useSensors(pointerSensor, touchSensor, keyboardSensor);

  const appIds = useMemo(() => apps.map((item) => item.id), [apps]);

  const [isOpenAppEdit, isOpenAppEditActions] = useBoolean(false);
  const [currentApp, setCurrentApp] = useState<IApp | null>(null);

  const { mutate: sortApp } = useMutation({
    mutationFn: (data: IApp[]) => fetcher.put(
      '/app/sort',
      data.map((item) => ({ id: item.id })),
    ),
    onMutate: async (newApps) => {
      await cancelQuery();
      const oldApps = getQueryData();
      setQueryData(newApps);
      return oldApps;
    },
    onError: (err, _, oldApps) => setQueryData(oldApps),
    onSettled: () => refetchApps(),
  });

  const { isLoading: createAppLoading, mutateAsync: createApp } = useMutation({
    mutationFn: (data: ICreateAppData) => fetcher.post<unknown, IApp>('/app/create', data),
    onSuccess: (app) => {
      setQueryData((oldApps = []) => [...oldApps, app]);
      refetchApps();
    },
  });

  const { mutateAsync: deleteApp } = useMutation({
    mutationFn: (appId: string) => fetcher.delete(`/app/delete/${appId}`),
    onSuccess: (_, appId) => {
      setQueryData((oldApps = []) => oldApps.filter((item) => item.id !== appId));
      refetchApps();
    },
  });

  const { mutateAsync: updateApp, isLoading: updateAppLoading } = useMutation({
    mutationFn: (data: IUpdateAppData) => fetcher.put<unknown, IApp>('/app/update', data),
    onSuccess: (app) => {
      const index = apps.findIndex((item) => item.id === app.id);
      if (index === -1) {
        return;
      }
      setQueryData((oldApps = []) => {
        const newApps = [...oldApps];
        newApps[index] = app;
        return newApps;
      });
      refetchApps();
    },
  });

  const onDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      if (!over || active.id === over.id) {
        return;
      }

      const oldIndex = appIds.indexOf(active.id as string);
      const newIndex = appIds.indexOf(over.id as string);
      sortApp(arrayMove(apps, oldIndex, newIndex));
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
                  onClick={isOpenAppEditActions.setTrue}
                  role="none"
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
