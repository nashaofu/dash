import ReactDOM from 'react-dom/client';
import { StrictMode, Suspense } from 'react';
import { ConfigProvider, theme, Spin } from 'antd';
import { RecoilRoot } from 'recoil';
import zhCN from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
import WeGo from './WeGo';
import 'dayjs/locale/zh-cn';
import './styles/index.scss';

dayjs.locale('zh-cn');

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: theme.defaultAlgorithm,
      }}
    >
      <RecoilRoot>
        <Suspense fallback={<Spin />}>
          <WeGo />
        </Suspense>
      </RecoilRoot>
    </ConfigProvider>
  </StrictMode>,
);
