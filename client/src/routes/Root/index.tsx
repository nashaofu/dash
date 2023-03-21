import { Outlet } from 'react-router-dom';
import SiteBar from '@/components/SiteBar';

export default function Root() {
  return (
    <>
      <Outlet />
      <SiteBar />
    </>
  );
}
