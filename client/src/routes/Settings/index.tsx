import {
  Button, Card, Form, InputNumber, Radio, Space, Spin,
} from 'antd';
import { useCallback, useEffect } from 'react';
import { useBoolean, useRequest } from 'ahooks';
import { EditOutlined, SaveOutlined } from '@ant-design/icons';
import { get } from 'lodash-es';
import fetcher from '@/utils/fetcher';
import { IUploadFile, uploadFileToUri, uriToUploadFile } from '@/utils/file';
import ImageUploader from '@/components/ImageUploader';
import { ISetting, ISettingTheme } from '@/types/setting';
import useMessage from '@/hooks/useMessage';
import useSetting from '@/store/setting';
import styles from './index.module.less';

interface ISettingsModel extends Pick<ISetting, 'theme' | 'bg_blur'> {
  bg_image: IUploadFile[];
}

interface ISettingsUpdateData extends Omit<ISettingsModel, 'bg_image'> {
  bg_image: string;
}

export default function Settings() {
  const [form] = Form.useForm<ISettingsModel>();
  const {
    data: setting,
    loading: fetchSettingLoading,
    refresh: refreshSetting,
  } = useSetting({
    manual: true,
  });

  const [isEditable, isEditableActions] = useBoolean(false);
  const message = useMessage();

  const { loading: updateSettingLoading, runAsync: updateSetting } = useRequest(
    (data: ISettingsUpdateData) => fetcher.put('/setting/update', data),
    {
      manual: true,
      onSuccess: () => refreshSetting(),
    },
  );

  const loading = fetchSettingLoading || updateSettingLoading;

  const onFinish = useCallback(async () => {
    const settingsModel = form.getFieldsValue();
    const bgImage = uploadFileToUri(settingsModel.bg_image?.[0]);
    if (!bgImage) {
      message.error('请上传背景图片');
      return;
    }
    try {
      await updateSetting({
        theme: settingsModel.theme,
        bg_image: bgImage,
        bg_blur: settingsModel.bg_blur,
      });
      message.success('保存成功');
      isEditableActions.setFalse();
    } catch (err) {
      message.error(get(err, 'response.data.message', '保存失败'));
      throw err;
    }
  }, [form, message, updateSetting, isEditableActions]);

  useEffect(() => {
    if (!setting) {
      return;
    }
    form.setFieldsValue({
      theme: setting.theme,
      bg_image: setting.bg_image ? [uriToUploadFile(setting.bg_image)] : [],
      bg_blur: setting.bg_blur,
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
                  type: 'number',
                  message: '请选择主题',
                },
              ]}
            >
              <Radio.Group
                options={[
                  { value: ISettingTheme.light, label: '浅色主题' },
                  { value: ISettingTheme.dark, label: '暗黑主题' },
                ]}
                optionType="button"
                buttonStyle="solid"
              />
            </Form.Item>
            <Form.Item
              label="背景图片"
              name="bg_image"
              required
              validateFirst
              rules={[
                {
                  validateTrigger: 'onSubmit',
                  validator: async (_, value?: IUploadFile[]) => {
                    if (!value?.[0]) {
                      throw new Error('请上传背景图片');
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
            <Form.Item label="背景模糊" name="bg_blur" required validateFirst>
              <InputNumber min={0} max={20} addonAfter="px" />
            </Form.Item>
          </Form>
        </Spin>
      </Card>
    </div>
  );
}
