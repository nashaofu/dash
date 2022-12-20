import { Avatar } from 'antd';
import { IApp } from '@/types/app';
import { uriToUrl } from '@/utils/file';

export interface IAppIconProps {
  app: IApp;
}

export default function AppIcon({ app }: IAppIconProps) {
  const icon = app?.icon ? uriToUrl(app.icon) : undefined;
  const name = app?.name?.slice(0, 4);
  const colors = ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae'];
  const style = icon
    ? undefined
    : { backgroundColor: colors[name.charCodeAt(0) % 4] };

  return (
    <Avatar size={56} src={icon} style={style} alt="应用图标" draggable={false}>
      {name}
    </Avatar>
  );
}
