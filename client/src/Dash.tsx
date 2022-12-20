import { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import {
  ConfigProvider, theme, Spin, App,
} from 'antd';
import zhCN from 'antd/locale/zh_CN';
import light from '@/assets/wallpaper/light.jpg';
import router from './router';
import { uriToUrl } from './utils/file';
import useSetting from './store/setting';
import { ISettingTheme } from './types/setting';
import styles from './dash.module.less';

export default function Dash() {
  const { data: setting, loading } = useSetting();
  const bgUrl = uriToUrl(setting?.bg_image);

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm:
          setting?.theme === ISettingTheme.dark
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
              backdropFilter: `blur(${setting?.bg_blur ?? 2}px)`,
            }}
          />
          <Spin spinning={loading}>
            {!loading && (
              <Suspense>
                <RouterProvider router={router} />
              </Suspense>
            )}
          </Spin>
        </div>
      </App>
    </ConfigProvider>
  );
}
