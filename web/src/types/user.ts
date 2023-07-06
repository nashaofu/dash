export enum ISettingTheme {
  Light = 'Light',
  Dark = 'Dark',
}

export interface ISetting {
  theme: ISettingTheme;
  bg_image?: string;
  bg_blur?: number;
}

export interface IUser {
  id: string;
  username: string;
  avatar?: string;
  setting?: ISetting;
  is_admin: boolean;
  created_at: string;
  deleted_at: string | null;
}
