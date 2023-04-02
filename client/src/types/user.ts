export enum ISettingTheme {
  Light = 'Light',
  Dark = 'Dark',
}

export interface ISetting {
  id: string;
  theme: ISettingTheme;
  bg_image?: string;
  bg_blur?: number;
  owner_id: string;
  created_at: string;
  deleted_at: string | null;
}

export interface IUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  setting?: ISetting;
  is_admin: boolean;
  created_at: string;
  deleted_at: string | null;
}
