import { lazy } from 'react';
import { Spin } from 'antd';
import { useRecoilValueLoadable } from 'recoil';
import { userState } from '@/recoil/user';
import styles from './index.module.scss';

const Apps = lazy(() => import('@/components/Apps'));
const Header = lazy(() => import('@/components/Header'));
const Login = lazy(() => import('@/components/Login'));

export default function WeGo() {
  const { state } = useRecoilValueLoadable(userState);

  return (
    <Spin size="large" spinning={state === 'loading'}>
      <div className={styles.weGo}>
        <div className={styles.background}>
          <div className={styles.backdrop} />
        </div>
        {state === 'hasValue' && (
          <>
            <Header />
            <Apps />
          </>
        )}
        {state === 'hasError' && <Login />}
      </div>
    </Spin>
  );
}
