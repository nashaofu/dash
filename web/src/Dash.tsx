import { useEffect, useRef, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import {
  ConfigProvider, theme, App, Spin,
} from 'antd';
import zhCN from 'antd/locale/zh_CN';
import wallpaper from '@/assets/wallpaper.png';
import router from './router';
import { uriToUrl } from './utils/file';
import useUser from './store/user';
import { ISettingTheme } from './types/user';
import styles from './dash.module.less';

export default function Dash() {
  const { data: user, isLoading } = useUser();
  const [url, setUrl] = useState<string>();

  const setting = user?.setting;
  const bgUrl = uriToUrl(setting?.bg_image);
  const urlRef = useRef(bgUrl);
  urlRef.current = bgUrl;

  useEffect(() => {
    if (!bgUrl) {
      setUrl(bgUrl);
      return;
    }

    const image = new Image();
    image.addEventListener('load', () => {
      // 保证加载最新的图片
      if (bgUrl !== urlRef.current) {
        return;
      }
      setUrl(bgUrl);
    });
    image.src = bgUrl;
  }, [bgUrl]);

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
            backgroundImage: `url("${url || wallpaper}")`,
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
          <Spin
            spinning={
              isLoading && !window.location.pathname.startsWith('/login')
            }
          >
            <RouterProvider router={router} />
          </Spin>
        </div>
      </App>
    </ConfigProvider>
  );
}
