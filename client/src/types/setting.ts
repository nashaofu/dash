export enum ISettingTheme {
  light = 1,
  dark = 2,
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
