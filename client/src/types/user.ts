export interface IUser {
  id: string
  name: string
  email: string
  avatar?: string
  is_admin: boolean
  created_at: string
  deleted_at: string | null
}
