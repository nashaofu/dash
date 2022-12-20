import { useCallback } from 'react';
import { message, Upload } from 'antd';
import { IUploadFile } from '@/utils/file';
import styles from './index.module.scss';

export interface IUploadOnChangeOpts {
  fileList: IUploadFile[]
}

export interface IImageUploaderProps {
  value?: IUploadFile[]
  maxCount?: number
  onChange?: (val: IUploadFile[]) => unknown
}

export default function ImageUploader({ value = [], maxCount, onChange }: IImageUploaderProps) {
  const isShowBtn = maxCount == null || value.length < maxCount;

  const beforeUpload = useCallback((file: File) => {
    const types = ['image/png', 'image/jpeg'];
    if (!types.includes(file.type)) {
      message.error('只支持png与jpeg格式的图片');
      return Upload.LIST_IGNORE;
    }

    return true;
  }, []);

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
        <div className={styles.icon}>
          <span className="iconfont icon-add" />
        </div>
      )}
    </Upload>
  );
}
