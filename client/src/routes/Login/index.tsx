import {
  Form, Input, Button, Spin, Checkbox, theme,
} from 'antd';
import { useCallback } from 'react';
import { useRequest, useLocalStorageState } from 'ahooks';
import fetcher from '@/utils/fetcher';
import useSetting from '@/store/setting';
import styles from './index.module.less';

interface LoginData {
  login: string;
  password: string;
}

export default function Login() {
  const {
    loading,
    error,
    runAsync: login,
  } = useRequest((data: LoginData) => fetcher.post('/auth/login', data), {
    manual: true,
  });
  const [loginStorage, setLoginStorage] = useLocalStorageState('Dash.login');
  const { refresh: refreshSetting } = useSetting({ manual: true });

  const { token } = theme.useToken();

  const [form] = Form.useForm<LoginData & { remember: boolean }>();
  const onFinish = useCallback(async () => {
    const { remember, ...model } = form.getFieldsValue();
    if (remember) {
      setLoginStorage(model.login);
    } else {
      setLoginStorage(undefined);
    }
    await login(model);
    refreshSetting();
    window.location.replace('/');
  }, [form, login, refreshSetting, setLoginStorage]);

  return (
    <div
      className={styles.login}
      style={{
        backgroundColor: token.colorBgContainer,
        color: token.colorText,
      }}
    >
      <Spin spinning={loading}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>Dash</div>
          <div className={styles.logoText}>我的私有的导航站</div>
        </div>
        <Form
          form={form}
          onFinish={onFinish}
          autoComplete="off"
          scrollToFirstError
        >
          <Form.Item
            name="login"
            required
            validateFirst
            initialValue={loginStorage}
            rules={[
              {
                required: true,
                message: '请输入用户名或邮箱',
              },
              {
                type: 'string',
                min: 5,
                max: 40,
                message: '用户名或邮箱长度必须为 5 - 30 个字符',
              },
            ]}
          >
            <Input placeholder="请输入用户名或邮箱" maxLength={30} />
          </Form.Item>

          <Form.Item
            name="password"
            required
            validateFirst
            rules={[
              {
                required: true,
                message: '请输入密码',
              },
              {
                type: 'string',
                max: 40,
                message: '密码长度不得超过 30 个字符',
              },
            ]}
          >
            <Input.Password placeholder="请输入密码" maxLength={30} />
          </Form.Item>

          <Form.Item name="remember" valuePropName="checked" initialValue>
            <Checkbox>记住用户名或邮箱</Checkbox>
          </Form.Item>

          <Form.Item>
            <Button type="primary" block htmlType="submit">
              登录
            </Button>
          </Form.Item>
        </Form>
        {error && (
          <div
            className={styles.error}
            style={{
              color: token.colorError,
            }}
          >
            登录失败： 用户名、邮箱或密码错误
          </div>
        )}
      </Spin>
    </div>
  );
}
