import { Button, Result, theme } from 'antd';
import { useNavigate } from 'react-router-dom';
import styles from './index.module.less';

export default function NotFound() {
  const { token } = theme.useToken();
  const navigate = useNavigate();

  return (
    <div
      className={styles.container}
      style={{
        backgroundColor: token.colorBgContainer,
        color: token.colorText,
      }}
    >
      <Result
        status="404"
        title="404"
        subTitle="页面不存在"
        extra={(
          <Button
            type="primary"
            onClick={() => navigate('/', { replace: true })}
          >
            返回首页
          </Button>
        )}
      />
    </div>
  );
}
