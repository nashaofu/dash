import { memo, useCallback } from 'react';
import { Upload, theme } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { IUploadFile } from '@/utils/file';
import useMessage from '@/hooks/useMessage';
import styles from './index.module.less';

export interface IUploadOnChangeOpts {
  fileList: IUploadFile[];
}

export interface IImageUploaderProps {
  value?: IUploadFile[];
  maxCount?: number;
  onChange?: (val: IUploadFile[]) => unknown;
}

export default memo(
  ({ value = [], maxCount, onChange }: IImageUploaderProps) => {
    const isShowBtn = maxCount == null || value.length < maxCount;
    const message = useMessage();
    const { token } = theme.useToken();

    const beforeUpload = useCallback(
      (file: File) => {
        const types = ['png', 'jpeg', 'jpg', 'ico', 'bmp', 'webp', 'svg'];
        const extname = file.name.split('.').slice(-1)[0];
        if (!types.includes(extname)) {
          message.error(`只支持 ${types.join('、')} 格式的图片`);
          return Upload.LIST_IGNORE;
        }

        return true;
      },
      [message],
    );

    const onUploadChange = useCallback(
      (e: IUploadOnChangeOpts) => {
        onChange?.(e.fileList);
      },
      [onChange],
    );

    return (
      <Upload
        fileList={value}
        name="file"
        listType="picture-card"
        action="/api/file/image/upload"
        maxCount={maxCount}
        beforeUpload={beforeUpload}
        onChange={onUploadChange}
      >
        {isShowBtn && (
          <div
            className={styles.btn}
            style={{
              color: `${token.colorTextSecondary}`,
            }}
          >
            <PlusOutlined />
          </div>
        )}
      </Upload>
    );
  },
);
