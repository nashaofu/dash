import {
  AppstoreOutlined, HomeOutlined, SettingOutlined, UserOutlined,
} from '@ant-design/icons';
import { FloatButton } from 'antd';
import { useNavigate } from 'react-router-dom';
import styles from './index.module.less';

export default function SiteBar() {
  const navigate = useNavigate();

  return (
    <FloatButton.Group shape="square" className={styles.container}>
      <FloatButton icon={<HomeOutlined />} tooltip="首页" onClick={() => navigate('/')} />
      <FloatButton icon={<AppstoreOutlined />} tooltip="应用管理" onClick={() => navigate('/apps')} />
      <FloatButton icon={<UserOutlined />} tooltip="用户管理" onClick={() => navigate('/users')} />
      <FloatButton icon={<SettingOutlined />} tooltip="站点设置" onClick={() => navigate('/settings')} />
    </FloatButton.Group>
  );
}
