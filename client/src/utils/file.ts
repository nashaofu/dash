import { UploadFile } from 'antd';
import fetcher from './fetcher';

export interface IUploadResp {
  uri: string;
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

export async function uploadFromUrl(url: string) {
  const icon = await fetcher.get<unknown, Blob>('/proxy/get', {
    params: {
      url: encodeURIComponent(url),
    },
    responseType: 'blob',
    timeout: 60000,
  });

  const formData = new FormData();
  const fileName = url?.split('/').slice(-1)[0] ?? 'icon.png';
  formData.append('file', icon, fileName);

  const { uri } = await fetcher.post<unknown, IUploadResp>(
    '/file/image/upload',
    formData,
    {
      timeout: 60000,
    },
  );

  return uri;
}
