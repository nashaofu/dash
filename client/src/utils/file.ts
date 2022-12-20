import { UploadFile } from 'antd';

export interface IUploadResp {
  uri: string
}

export type IUploadFile = UploadFile<IUploadResp>;

export function uriToUploadFile(uri: undefined): undefined;
export function uriToUploadFile(uri: string): IUploadFile;
export function uriToUploadFile(uri?: string): IUploadFile | undefined {
  if (!uri) {
    return undefined;
  }

  return {
    uid: uri,
    name: uri,
    url: `/files/${uri}`,
    status: 'done',
    response: {
      uri,
    },
  };
}

export function uploadFileToUri(uploadFile?: IUploadFile): string | undefined {
  return uploadFile?.response?.uri;
}

export function uriToUrl(uri?: string): string | undefined {
  return uri ? `/files/${uri}` : undefined;
}
