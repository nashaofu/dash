import { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import {
  ConfigProvider, theme, Spin, App,
} from 'antd';
import zhCN from 'antd/locale/zh_CN';
import light from '@/assets/wallpaper/light.jpg';
import router from './router';
import { uriToUrl } from './utils/file';
import useUser from './store/user';
import { ISettingTheme } from './types/user';
import styles from './dash.module.less';

export default function Dash() {
  const { data: user, isLoading } = useUser();
  const setting = user?.setting;
  const bgUrl = uriToUrl(setting?.bg_image);

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm:
          setting?.theme === ISettingTheme.Dark
            ? theme.darkAlgorithm
            : theme.defaultAlgorithm,
      }}
    >
      <App>
        <div
          className={styles.dash}
          style={{
            backgroundImage: `url("${bgUrl || light}")`,
          }}
        >
          <div
            className={styles.backdrop}
            style={{
              backdropFilter: setting?.bg_blur
                ? `blur(${setting?.bg_blur}px)`
                : 'none',
            }}
          />
          <Spin spinning={isLoading}>
            {!isLoading && (
              <Suspense fallback={<Spin spinning />}>
                <RouterProvider router={router} />
              </Suspense>
            )}
          </Spin>
        </div>
      </App>
    </ConfigProvider>
  );
}
