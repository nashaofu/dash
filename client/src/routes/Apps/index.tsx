import { useCallback, useMemo, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { Spin } from 'antd';
import useSWRMutation from '@/hooks/useSWRMutation';
import useBoolean from '@/hooks/useBoolean';
import AppEdit, { IAppEditData } from '@/components/AppEdit';
import fetcher from '@/utils/fetcher';
import { IApp } from '@/types/app';
import useModal from '@/hooks/useModal';
import useMessage from '@/hooks/useMessage';
import EditableApp from './components/EditableApp';
import styles from './index.module.less';
import useApps from '@/store/apps';

type ISortAppData = Array<{ id: string }>;

export default function Apps() {
  const {
    data: apps = [],
    isLoading: fetchAppsLoading,
    mutate: mutateApps,
  } = useApps();

  const modal = useModal();
  const message = useMessage();
  const pointerSensor = useSensor(PointerSensor);
  const keyboardSensor = useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  });
  const sensors = useSensors(pointerSensor, keyboardSensor);

  const appIds = useMemo(() => apps.map((item) => item.id), [apps]);

  const [isOpenAppEdit, isOpenAppEditActions] = useBoolean(false);
  const [currentApp, setCurrentApp] = useState<IApp | null>(null);

  const { isMutating: sortAppLoading, trigger: sortApp } = useSWRMutation<ISortAppData>('/app/sort', fetcher.put, {
    onSuccess: () => mutateApps(),
  });

  const { isMutating: createAppLoading, trigger: createApp } = useSWRMutation<IAppEditData>(
    '/app/create',
    fetcher.post,
    {
      onSuccess: () => mutateApps(),
    },
  );

  const { trigger: deleteApp } = useSWRMutation<string>(
    '/app/delete',
    (url, id) => fetcher.delete(`${url}/${id}`),
    {
      onSuccess: () => mutateApps(),
    },
  );

  const { trigger: updateApp, isMutating: updateAppLoading } = useSWRMutation<
  IAppEditData & { id: string }
  >('/app/update', fetcher.put, {
    onSuccess: () => mutateApps(),
  });

  const onDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      if (!over || active.id === over.id) {
        return;
      }

      const oldIndex = appIds.indexOf(active.id as string);
      const newIndex = appIds.indexOf(over.id as string);
      mutateApps(arrayMove(apps, oldIndex, newIndex));
      const ids = arrayMove(appIds, oldIndex, newIndex);
      sortApp(ids.map((id) => ({ id })));
    },
    [appIds, apps, mutateApps, sortApp],
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
      <Spin spinning={fetchAppsLoading || sortAppLoading}>
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
