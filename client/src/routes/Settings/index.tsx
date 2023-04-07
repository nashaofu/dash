import {
  Button, Card, Form, InputNumber, Radio, Space, Spin,
} from 'antd';
import { useCallback, useEffect } from 'react';
import { EditOutlined, SaveOutlined } from '@ant-design/icons';
import { get } from 'lodash-es';
import { useMutation } from '@tanstack/react-query';
import useBoolean from '@/hooks/useBoolean';
import fetcher from '@/utils/fetcher';
import { IUploadFile, uploadFileToUri, uriToUploadFile } from '@/utils/file';
import ImageUploader from '@/components/ImageUploader';
import { ISetting, ISettingTheme } from '@/types/user';
import useMessage from '@/hooks/useMessage';
import useUser from '@/queries/user';
import styles from './index.module.less';

interface ISettingsModel extends Pick<ISetting, 'theme' | 'bg_blur'> {
  bg_image: IUploadFile[];
}

export default function Settings() {
  const [form] = Form.useForm<ISettingsModel>();
  const {
    data: user,
    isLoading: fetchUserLoading,
    setQueryData,
    invalidateQueries,
  } = useUser();

  const setting = user?.setting;

  const [isEditable, isEditableActions] = useBoolean(false);
  const message = useMessage();

  const { isLoading: updateSettingLoading, mutateAsync: updateSetting } = useMutation({
    mutationFn: (data: ISetting) => fetcher.put<ISetting>('/setting/update', data),
    onSuccess: (_, newSetting) => {
      message.success('保存成功');
      setQueryData((oldUser) => {
        if (!oldUser) {
          return undefined;
        }

        return {
          ...oldUser,
          setting: newSetting,
        };
      });
      isEditableActions.setFalse();
    },
    onError: (err) => {
      message.error(get(err, 'response.data.message', '保存失败'));
    },
    onSettled: () => {
      invalidateQueries();
    },
  });

  const loading = fetchUserLoading || updateSettingLoading;

  const onFinish = useCallback(async () => {
    const settingsModel = form.getFieldsValue();
    const bgImage = uploadFileToUri(settingsModel.bg_image?.[0]);

    await updateSetting({
      theme: settingsModel.theme,
      bg_image: bgImage,
      bg_blur: settingsModel.bg_blur,
    });
  }, [form, updateSetting]);

  useEffect(() => {
    if (!setting) {
      return;
    }
    form.setFieldsValue({
      theme: setting.theme,
      bg_image: setting.bg_image ? [uriToUploadFile(setting.bg_image)] : [],
      bg_blur: setting.bg_blur ?? 0,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setting]);

  return (
    <div className={styles.settings}>
      <Card
        title="设置"
        className={styles.card}
        extra={(
          <Space.Compact>
            {isEditable ? (
              <Button
                loading={loading}
                icon={<SaveOutlined />}
                title="保存设置"
                onClick={form.submit}
              />
            ) : (
              <Button
                loading={loading}
                icon={<EditOutlined />}
                title="编辑"
                onClick={isEditableActions.setTrue}
              />
            )}
          </Space.Compact>
        )}
      >
        <Spin spinning={loading}>
          <Form
            form={form}
            disabled={!isEditable}
            autoComplete="off"
            onFinish={onFinish}
            layout="vertical"
            scrollToFirstError
          >
            <Form.Item
              label="主题"
              name="theme"
              required
              validateFirst
              rules={[
                {
                  required: true,
                  type: 'enum',
                  enum: [ISettingTheme.Light, ISettingTheme.Dark],
                  message: '请选择主题',
                },
              ]}
            >
              <Radio.Group
                options={[
                  { value: ISettingTheme.Light, label: '浅色主题' },
                  { value: ISettingTheme.Dark, label: '暗黑主题' },
                ]}
                optionType="button"
                buttonStyle="solid"
              />
            </Form.Item>
            <Form.Item
              label="背景图片"
              name="bg_image"
              validateFirst
              rules={[
                {
                  validateTrigger: 'onSubmit',
                  validator: async (_, value?: IUploadFile[]) => {
                    if (!value?.length) {
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
            <Form.Item label="背景模糊" name="bg_blur" validateFirst>
              <InputNumber min={0} max={20} addonAfter="px" />
            </Form.Item>
          </Form>
        </Spin>
      </Card>
    </div>
  );
}
