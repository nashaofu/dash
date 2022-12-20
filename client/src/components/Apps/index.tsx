import { useCallback, useState } from 'react';
import { DndContext } from '@dnd-kit/core';
import { IApp, useApps } from '@/recoil/apps';
import App from '../App';
import AppEdit, { IAppEditData } from '../AppEdit';
import styles from './index.module.scss';

export default function Apps() {
  const { apps, updateApp, deleteApp } = useApps();
  const [currentApp, setCurrentApp] = useState<IApp | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const onAppEdit = useCallback((app: IApp) => {
    setCurrentApp(app);
  }, []);

  const onAppDelete = useCallback((app: IApp) => deleteApp(app.id), [deleteApp]);

  const onAppEditOk = useCallback(
    async (app: IAppEditData) => {
      if (!currentApp) {
        return;
      }
      setEditLoading(true);
      try {
        await updateApp({
          ...app,
          id: currentApp.id,
        });
        setCurrentApp(null);
      } finally {
        setEditLoading(false);
      }
    },
    [updateApp, currentApp],
  );

  const onAppEditCancel = useCallback(() => {
    setCurrentApp(null);
  }, []);

  return (
    <DndContext>
      <div className={styles.apps}>
        {apps.map((item) => (
          <App key={item.id} app={item} onEdit={onAppEdit} onDelete={onAppDelete} />
        ))}
      </div>
      <AppEdit
        open={!!currentApp}
        app={currentApp}
        loading={editLoading}
        onOk={onAppEditOk}
        onCancel={onAppEditCancel}
      />
    </DndContext>
  );
}
