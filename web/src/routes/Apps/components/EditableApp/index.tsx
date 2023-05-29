import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import cls from 'classnames';
import {
  DeleteOutlined,
  EditOutlined,
  HolderOutlined,
} from '@ant-design/icons';
import {
  Avatar, Button, Space, theme,
} from 'antd';
import styles from './index.module.less';
import { IApp } from '@/types/app';
import App from '@/components/App';
import { getBackgroundColor } from '@/components/AppIcon';

interface IEditableAppProps {
  id: string;
  app: IApp;
  onEdit: (app: IApp) => unknown;
  onDelete: (app: IApp) => unknown;
}

export default function EditableApp({
  id,
  app,
  onEdit,
  onDelete,
}: IEditableAppProps) {
  const {
    setNodeRef,
    transform,
    transition,
    attributes,
    listeners,
    isDragging,
  } = useSortable({ id });
  const { token } = theme.useToken();

  return (
    <div
      ref={setNodeRef}
      className={cls(styles.draggable, isDragging && styles.dragging)}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...attributes}
    >
      <App app={app} clickable={false} />
      <div
        className={styles.body}
        style={{
          backgroundColor: token.colorBgContainer,
          border: `1px solid ${token.colorBgBase}`,
        }}
      >
        <div
          className={styles.holder}
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...listeners}
        >
          <Avatar
            size={56}
            alt="应用图标"
            draggable={false}
            icon={<HolderOutlined className={styles.holderIcon} />}
            style={{
              backgroundColor: getBackgroundColor(app.name),
            }}
          />
        </div>
        <div
          className={styles.name}
          style={{
            color: token.colorText,
          }}
        >
          {app.name}
        </div>
        <div>
          <Space>
            <Button
              shape="circle"
              type="primary"
              icon={<EditOutlined />}
              onClick={() => onEdit(app)}
            />
            <Button
              shape="circle"
              type="primary"
              danger
              icon={<DeleteOutlined />}
              onClick={() => onDelete(app)}
            />
          </Space>
        </div>
      </div>
    </div>
  );
}
