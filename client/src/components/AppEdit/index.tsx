import { useCallback, useEffect } from 'react';
import {
  Form, Input, Modal, Space, Button, Tooltip,
} from 'antd';
import useSWRMutation from 'swr/mutation';
import { get } from 'lodash-es';
import { InfoCircleOutlined } from '@ant-design/icons';
import { IApp } from '@/types/app';
import ImageUploader from '../ImageUploader';
import {
  IUploadFile,
  uploadFileToUri,
  uriToUploadFile,
  uploadFromUrl,
} from '@/utils/file';
import fetcher from '@/utils/fetcher';
import useMessage from '@/hooks/useMessage';

interface IAppModel extends Pick<IApp, 'url' | 'name' | 'description'> {
  icon?: IUploadFile[];
}

export interface IAppEditData extends Omit<IAppModel, 'icon'> {
  icon?: string;
}

export interface IAppEditProps {
  app?: IApp | null;
  open: boolean;
  loading: boolean;
  onOk: (app: IAppEditData) => unknown;
  onCancel: () => unknown;
}

export default function AppEdit({
  app,
  open,
  loading,
  onOk,
  onCancel,
}: IAppEditProps) {
  const [form] = Form.useForm<IAppModel>();
  const message = useMessage();

  const { isMutating, trigger: crawl } = useSWRMutation(
    '/proxy/get',
    async (url, { arg }: { arg: string }) => {
      const html = await fetcher.get<unknown, string>(url, {
        params: {
          url: encodeURIComponent(arg),
        },
        timeout: 60000,
      });
      const domParser = new DOMParser();
      const dom = domParser.parseFromString(html, 'text/html');
      const name = dom.querySelector('title')?.textContent;
      const description = dom
        .querySelector('meta[name="description"]')
        ?.getAttribute('content');
      const icon = dom.querySelector('link[rel="icon"]')?.getAttribute('href');

      let uri: string | undefined;

      if (icon) {
        const { origin } = new URL(arg);
        try {
          uri = await uploadFromUrl(new URL(icon, origin).toString());
        } catch (err) {
          message.error('自动抓取图标失败');
          // eslint-disable-next-line no-console
          console.error(err);
        }
      }

      return {
        name,
        description,
        icon: uri,
      };
    },
    {
      onSuccess: (data) => {
        form.setFieldsValue({
          name: data.name ?? '',
          description: data.description ?? '',
          icon: data.icon ? [uriToUploadFile(data.icon)] : [],
        });
      },
      onError: (err) => {
        message.error(get(err, 'response.data.message', '自动抓取失败'));
      },
    },
  );

  const onCrawl = useCallback(async () => {
    const { url } = await form.validateFields(['url']);
    crawl(url);
  }, [form, crawl]);

  const onFinish = useCallback(() => {
    const appModel = form.getFieldsValue();
    onOk({
      url: appModel.url,
      name: appModel.name,
      description: appModel.description,
      icon: uploadFileToUri(appModel.icon?.[0]),
    });
  }, [form, onOk]);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (app) {
      form.setFieldsValue({
        name: app.name,
        url: app.url,
        description: app.description,
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
      <Form
        form={form}
        name={app?.id}
        layout="vertical"
        autoComplete="off"
        onFinish={onFinish}
        scrollToFirstError
      >
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
          <Space.Compact block>
            <Input showCount maxLength={255} />
            <Button type="default" loading={isMutating} onClick={onCrawl}>
              自动抓取
              <Tooltip
                placement="topRight"
                title="支持根据输入 URL 自动抓取名称、描述与图标"
                arrow={{
                  pointAtCenter: true,
                }}
              >
                <InfoCircleOutlined />
              </Tooltip>
            </Button>
          </Space.Compact>
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
          label="应用描述"
          name="description"
          validateFirst
          rules={[
            {
              type: 'string',
              max: 255,
              message: '应用描述长度不得超过 255 个字符',
            },
          ]}
        >
          <Input.TextArea
            showCount
            maxLength={255}
            autoSize={{ minRows: 3, maxRows: 5 }}
          />
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
