import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { SWRConfig } from 'swr';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import './styles/index.less';

import Dash from './Dash';

dayjs.locale('zh-cn');

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <SWRConfig>
      <Dash />
    </SWRConfig>
  </StrictMode>,
);
