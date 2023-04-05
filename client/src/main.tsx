import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { SWRConfig, Cache } from 'swr';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import './styles/index.less';

import Dash from './Dash';

dayjs.locale('zh-cn');

function localStorageProvider() {
  const key = 'Dash.app-cache';
  // 初始化时，我们将数据从 `localStorage` 恢复到一个 map 中。
  const map = new Map(JSON.parse(localStorage.getItem(key) || '[]'));

  // 在卸载 app 之前，我们将所有数据写回 `localStorage` 中。
  window.addEventListener('beforeunload', () => {
    const appCache = JSON.stringify(Array.from(map.entries()));
    localStorage.setItem(key, appCache);
  });

  // 我们仍然使用 map 进行读写以提高性能。
  return map as Cache;
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <SWRConfig value={{ provider: localStorageProvider }}>
      <Dash />
    </SWRConfig>
  </StrictMode>,
);
