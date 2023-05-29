import { useCallback, useEffect } from 'react';
import { Form, Input, Modal } from 'antd';
import useSWRMutation from 'swr/mutation';
import { get } from 'lodash-es';
import { IUser } from '@/types/user';
import fetcher from '@/utils/fetcher';
import ImageUploader from '../ImageUploader';
import { IUploadFile, uploadFileToUri, uriToUploadFile } from '@/utils/file';
import useMessage from '@/hooks/useMessage';

interface IUserModel extends Pick<IUser, 'username'> {
  avatar?: IUploadFile[];
}

interface IUserUpdateData extends Omit<IUserModel, 'avatar'> {
  avatar?: string;
}

export interface IUserUpdateProps {
  user?: IUser;
  open: boolean;
  onOk: (user: IUser) => unknown;
  onCancel: () => unknown;
}

export default function UserUpdate({
  user,
  open,
  onOk,
  onCancel,
}: IUserUpdateProps) {
  const [form] = Form.useForm<IUserModel>();
  const message = useMessage();

  const { isMutating, trigger: updateUser } = useSWRMutation(
    '/user/update',
    (url, { arg }: { arg: IUserUpdateData }) => fetcher.put<unknown, IUser>(url, arg),
    {
      onSuccess: (data) => {
        onOk(data);
        message.success('账号设置成功');
      },
      onError: (err) => {
        message.error(get(err, 'response.data.message', '账号设置失败'));
      },
    },
  );

  const onFinish = useCallback(() => {
    const userModel = form.getFieldsValue();
    updateUser({
      username: userModel.username,
      avatar: uploadFileToUri(userModel.avatar?.[0]),
    });
  }, [form, updateUser]);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (user) {
      form.setFieldsValue({
        username: user.username,
        avatar: user.avatar ? [uriToUploadFile(user.avatar)] : [],
      });
    } else {
      form.resetFields();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Modal
      title="账号设置"
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
          label="用户名"
          name="username"
          required
          validateFirst
          rules={[
            {
              type: 'string',
              required: true,
              message: '请输入用户名',
            },
            {
              type: 'string',
              pattern: /^[a-zA-Z0-9][\x21-\x7e]{4,29}$/,
              message:
                '用户名必须为 ASCII 码中的可见字符组成的 5-30 个字符，且只能由字母或数字开头',
            },
          ]}
        >
          <Input showCount maxLength={30} />
        </Form.Item>
        <Form.Item
          label="用户头像"
          name="avatar"
          validateFirst
          rules={[
            {
              validateTrigger: 'onSubmit',
              validator: async (_, value?: IUploadFile[]) => {
                if (!value?.[0]) {
                  return;
                }

                if (value[0].status !== 'done') {
                  throw new Error('文件没有上传完成');
                }

                if (!value[0].response?.uri) {
                  throw new Error('文件没有上传成功');
                }
              },
            },
          ]}
        >
          <ImageUploader maxCount={1} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
