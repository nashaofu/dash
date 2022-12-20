use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq, Serialize, Deserialize)]
#[sea_orm(table_name = "apps")]
pub struct Model {
  #[sea_orm(primary_key)]
  pub id: i64,
  pub name: String,
  pub url: String,
  #[sea_orm(nullable)]
  pub description: Option<String>,
  #[sea_orm(nullable)]
  pub icon: Option<String>,
  pub owner_id: i64,
  pub created_at: DateTime,
  #[sea_orm(nullable)]
  pub deleted_at: Option<DateTime>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
