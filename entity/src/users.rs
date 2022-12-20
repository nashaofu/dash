use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq, Serialize, Deserialize)]
#[sea_orm(table_name = "users")]
pub struct Model {
  #[sea_orm(primary_key)]
  pub id: i64,
  #[sea_orm(unique, indexed)]
  pub name: String,
  #[sea_orm(unique, indexed)]
  pub email: String,
  // JSON 序列化时不会传到前端
  #[serde(skip_serializing)]
  pub password: String,
  pub avatar: Option<String>,
  pub is_admin: bool,
  pub created_at: DateTime,
  #[sea_orm(nullable)]
  pub deleted_at: Option<DateTime>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
