import { Suspense, memo } from 'react';
import { Outlet } from 'react-router-dom';
import SiteBar from '@/components/SiteBar';
import NProgress from '@/components/NProgress';

export default memo(() => (
  <>
    <Suspense fallback={<NProgress />}>
      <Outlet />
    </Suspense>
    <SiteBar />
  </>
));
