import { useCallback, useEffect } from 'react';
import { Form, Input, Modal } from 'antd';
import useSWRMutation from 'swr/mutation';
import { get } from 'lodash-es';
import fetcher from '@/utils/fetcher';
import useMessage from '@/hooks/useMessage';

interface IPasswordUpdateModel {
  old_password: string;
  password: string;
  confirm_password: string;
}

export interface IPasswordUpdateProps {
  open: boolean;
  onOk: () => unknown;
  onCancel: () => unknown;
}

export default function PasswordUpdate({
  open,
  onOk,
  onCancel,
}: IPasswordUpdateProps) {
  const [form] = Form.useForm<IPasswordUpdateModel>();
  const message = useMessage();

  const { isMutating, trigger: updatePassword } = useSWRMutation(
    '/password/update',
    (url, { arg }: { arg: IPasswordUpdateModel }) => fetcher.put(url, arg),
    {
      onSuccess: () => {
        onOk();
        message.success('密码设置成功');
      },
      onError: (err) => {
        message.error(get(err, 'response.data.message', '密码设置失败'));
      },
    },
  );

  const onFinish = useCallback(() => {
    const passwordUpdateModel = form.getFieldsValue();
    updatePassword({
      old_password: passwordUpdateModel.old_password,
      password: passwordUpdateModel.password,
      confirm_password: passwordUpdateModel.confirm_password,
    });
  }, [form, updatePassword]);

  useEffect(() => {
    if (!open) {
      return;
    }

    form.resetFields();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Modal
      title="密码设置"
      open={open}
      onOk={form.submit}
      onCancel={onCancel}
      closable={!isMutating}
      maskClosable={false}
      keyboard={false}
      okButtonProps={{
        loading: isMutating,
      }}
      cancelButtonProps={{
        loading: isMutating,
      }}
    >
      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
        onFinish={onFinish}
        scrollToFirstError
      >
        <Form.Item
          label="旧密码"
          name="old_password"
          required
          validateFirst
          rules={[
            {
              required: true,
              message: '请输入旧密码',
            },
            {
              type: 'string',
              max: 40,
              message: '旧密码长度不得超过 30 个字符',
            },
          ]}
        >
          <Input.Password maxLength={30} />
        </Form.Item>
        <Form.Item
          label="新密码"
          name="password"
          required
          validateFirst
          rules={[
            {
              type: 'string',
              required: true,
              message: '请输入新密码',
            },
            {
              type: 'string',
              pattern: /^[\x21-\x7e]{8,30}$/,
              message: '新密码必须为 ASCII 码中的可见字符组成的 8 - 30 个字符',
            },
          ]}
        >
          <Input.Password showCount maxLength={30} />
        </Form.Item>
        <Form.Item
          label="重复密码"
          name="confirm_password"
          required
          validateFirst
          rules={[
            {
              type: 'string',
              required: true,
              message: '请输入重复密码',
            },
            {
              type: 'string',
              pattern: /^[\x21-\x7e]{8,30}$/,
              message:
                '重复密码必须为 ASCII 码中的可见字符组成的 8 - 30 个字符',
            },
            ({ getFieldValue }) => ({
              validator: async (_, value) => {
                if (getFieldValue('password') !== value) {
                  throw new Error('重复密码与密码不一致');
                }
              },
            }),
          ]}
        >
          <Input.Password showCount maxLength={30} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
