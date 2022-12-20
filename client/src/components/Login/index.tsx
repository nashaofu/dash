import {
  Form, Input, Button, Spin, Checkbox,
} from 'antd';
import { useRecoilRefresher_UNSTABLE } from 'recoil';
import { useMemo, useCallback } from 'react';
import useRequest from '@/hooks/useRequest';
import { userState } from '@/recoil/user';
import fetcher from '@/utils/fetcher';
import styles from './index.module.scss';
import useLocalStorage from '@/hooks/useLocalStorage';

interface LoginData {
  login: string
  password: string
}

export default function Login() {
  const { loading, error, fetch } = useRequest((data: LoginData) => fetcher.post('/auth/login', data));
  const refresh = useRecoilRefresher_UNSTABLE(userState);
  const loginStorage = useLocalStorage('login');
  const loginInitialValue = useMemo(() => loginStorage.get(), [loginStorage]);

  const [form] = Form.useForm<LoginData & { remember: boolean }>();
  const onFinish = useCallback(async () => {
    const { remember, ...model } = form.getFieldsValue();
    if (remember) {
      loginStorage.set(model.login);
    } else {
      loginStorage.remove();
    }
    await fetch(model);
    refresh();
  }, [form, fetch, loginStorage, refresh]);

  return (
    <div className={styles.login}>
      <Spin spinning={loading}>
        <>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>WeGo</div>
            <div className={styles.logoText}>我的私有的导航站</div>
          </div>
          <Form form={form} onFinish={onFinish} autoComplete="off" scrollToFirstError>
            <Form.Item
              name="login"
              required
              validateFirst
              initialValue={loginInitialValue}
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
              <Button className={styles.btn} type="primary" htmlType="submit">
                登录
              </Button>
            </Form.Item>
          </Form>
          {error && <div className={styles.error}>登录失败： 用户名、邮箱或密码错误</div>}
        </>
      </Spin>
    </div>
  );
}
