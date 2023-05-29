import {
  Form, Input, Button, Spin, Checkbox, theme,
} from 'antd';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { mutate } from 'swr';
import useSWRMutation from 'swr/mutation';
import { get } from 'lodash-es';
import fetcher from '@/utils/fetcher';
import useUser from '@/store/user';
import styles from './index.module.less';
import { IUser } from '@/types/user';
import useLocalStorage from '@/hooks/useLocalStorage';

interface ILoginData {
  username: string;
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
        mutate(() => true, undefined, {
          revalidate: false,
        });
        mutateUser(data);
        navigate('/', { replace: true });
      },
    },
  );

  const [usernameStorage, setUsernameStorage] = useLocalStorage<string>('username');

  const { token } = theme.useToken();

  const [form] = Form.useForm<ILoginData & { remember: boolean }>();

  const onFinish = useCallback(async () => {
    const { remember, ...model } = form.getFieldsValue();
    if (remember) {
      setUsernameStorage(model.username);
    } else {
      setUsernameStorage(undefined);
    }
    login(model);
  }, [form, login, setUsernameStorage]);

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
            name="username"
            required
            validateFirst
            initialValue={usernameStorage}
            rules={[
              {
                required: true,
                message: '请输入用户名',
              },
              {
                type: 'string',
                min: 5,
                max: 40,
                message: '用户名长度必须为 5 - 30 个字符',
              },
            ]}
          >
            <Input placeholder="请输入用户名" maxLength={30} />
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
            <Checkbox>记住用户名</Checkbox>
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
            {get(error, 'response.data.message', '用户名或密码错误')}
          </div>
        )}
      </Spin>
    </div>
  );
}
