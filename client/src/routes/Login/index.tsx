import {
  Form, Input, Button, Spin, Checkbox, theme,
} from 'antd';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useSWRMutation from 'swr/mutation';
import { get } from 'lodash-es';
import fetcher from '@/utils/fetcher';
import useUser from '@/store/user';
import styles from './index.module.less';
import { IUser } from '@/types/user';
import useLocalStorage from '@/hooks/useLocalStorage';

interface ILoginData {
  login: string;
  password: string;
}

export default function Login() {
  const navigate = useNavigate();
  const { mutate: mutateUser } = useUser();

  const {
    isMutating,
    error,
    trigger: login,
  } = useSWRMutation(
    '/auth/login',
    (url, { arg }: { arg: ILoginData }) => fetcher.post<unknown, IUser>(url, arg),
    {
      onSuccess: (data) => {
        mutateUser(data);
        navigate('/', { replace: true });
      },
    },
  );

  const [loginStorage, setLoginStorage] = useLocalStorage<string>('login');

  const { token } = theme.useToken();

  const [form] = Form.useForm<ILoginData & { remember: boolean }>();

  const onFinish = useCallback(async () => {
    const { remember, ...model } = form.getFieldsValue();
    if (remember) {
      setLoginStorage(model.login);
    } else {
      setLoginStorage(undefined);
    }
    login(model);
  }, [form, login, setLoginStorage]);

  return (
    <div
      className={styles.login}
      style={{
        backgroundColor: token.colorBgContainer,
        color: token.colorText,
      }}
    >
      <Spin spinning={isMutating}>
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
        {!!error && (
          <div
            className={styles.error}
            style={{
              color: token.colorError,
            }}
          >
            登录失败：
            {get(error, 'response.data.message', '用户名、邮箱或密码错误')}
          </div>
        )}
      </Spin>
    </div>
  );
}
