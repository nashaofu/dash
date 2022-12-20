export interface IApp {
  id: string;
  name: string;
  url: string;
  description?: string;
  icon?: string;
  owner_id?: string;
  created_at: string;
  deleted_at: string | null;
}
