import { useCallback, useEffect } from 'react';
import { Form, Input, Modal } from 'antd';
import { IApp } from '@/recoil/apps';
import ImageUploader from '../ImageUploader';
import { IUploadFile, uploadFileToUri, uriToUploadFile } from '@/utils/file';

interface IAppModel extends Pick<IApp, 'url' | 'name'> {
  icon?: IUploadFile[]
}

export interface IAppEditData extends Omit<IAppModel, 'icon'> {
  icon?: string
}

export interface IAppEditProps {
  app?: IApp | null
  open: boolean
  loading: boolean
  onOk: (app: IAppEditData) => unknown
  onCancel: () => unknown
}

export default function AppEdit({
  app, open, loading, onOk, onCancel,
}: IAppEditProps) {
  const [form] = Form.useForm<IAppModel>();
  const onFinish = useCallback(() => {
    const appModel = form.getFieldsValue();
    onOk({
      url: appModel.url,
      name: appModel.name,
      icon: uploadFileToUri(appModel.icon?.[0]),
    });
  }, [form, onOk]);

  useEffect(() => {
    if (open) {
      return;
    }

    if (app) {
      form.setFieldsValue({
        name: app.name,
        url: app.url,
        icon: app.icon ? [uriToUploadFile(app.icon)] : [],
      });
    } else {
      form.resetFields();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Modal
      title={app ? '编辑应用' : '创建应用'}
      open={open}
      onOk={form.submit}
      onCancel={onCancel}
      closable={!loading}
      maskClosable={false}
      keyboard={false}
      okButtonProps={{
        loading,
      }}
      cancelButtonProps={{
        loading,
      }}
    >
      <Form form={form} name={app?.id} layout="vertical" autoComplete="off" onFinish={onFinish} scrollToFirstError>
        <Form.Item
          label="应用 URL"
          name="url"
          required
          validateFirst
          rules={[
            {
              type: 'url',
              required: true,
              message: '请输入合法的应用 URL',
            },
            {
              type: 'string',
              max: 255,
              message: '应用 URL 长度不得超过 255 个字符',
            },
          ]}
        >
          <Input showCount maxLength={255} />
        </Form.Item>
        <Form.Item
          label="应用名称"
          name="name"
          required
          validateFirst
          rules={[
            {
              type: 'string',
              required: true,
              message: '请填写应用名称',
            },
            {
              type: 'string',
              max: 30,
              message: '应用名称长度不得超过 30 个字符',
            },
          ]}
        >
          <Input showCount maxLength={30} />
        </Form.Item>
        <Form.Item
          label="应用图标"
          name="icon"
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
