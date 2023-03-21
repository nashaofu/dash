use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq, Serialize, Deserialize)]
#[sea_orm(table_name = "settings")]
pub struct Model {
  #[sea_orm(primary_key)]
  pub id: i64,
  #[sea_orm(nullable)]
  pub theme: Option<i8>,
  #[sea_orm(nullable)]
  pub bg_image: Option<String>,
  #[sea_orm(nullable)]
  pub bg_blur: Option<i8>,
  pub owner_id: i64,
  pub created_at: DateTime,
  #[sea_orm(nullable)]
  pub deleted_at: Option<DateTime>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
