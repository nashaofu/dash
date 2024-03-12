use utils::serialize::i64_to_str;

use sea_orm::{entity::prelude::*, FromJsonQueryResult};
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq, Serialize, Deserialize)]
#[sea_orm(table_name = "users")]
pub struct Model {
  #[sea_orm(primary_key)]
  #[serde(serialize_with = "i64_to_str")]
  pub id: i64,
  #[sea_orm(unique, indexed)]
  pub username: String,
  // JSON 序列化时不会传到前端
  #[serde(skip_serializing)]
  pub password: String,
  pub avatar: Option<String>,
  pub setting: Option<Setting>,
  pub is_admin: bool,
  pub created_at: DateTime,
  #[sea_orm(nullable)]
  pub deleted_at: Option<DateTime>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum SettingTheme {
  Light,
  Dark,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize, FromJsonQueryResult)]
pub struct Setting {
  pub theme: SettingTheme,
  pub bg_image: Option<String>,
  pub bg_blur: Option<i8>,
}
