use crate::errors::AppError;

use actix_web::http::StatusCode;
use entity::apps;
use sea_orm::{
  entity::Set, ActiveModelTrait, ColumnTrait, DbConn, DbErr, DeleteResult, EntityTrait,
  IntoActiveModel, ModelTrait, PaginatorTrait, QueryFilter, TransactionTrait,
};
use serde::{Deserialize, Serialize};
use utils::deserialize::str_to_i64;
use validator::Validate;

pub async fn get_user_all_app(db: &DbConn, user_id: i64) -> Result<Vec<apps::Model>, AppError> {
  apps::Entity::find()
    .filter(apps::Column::OwnerId.eq(user_id))
    .all(db)
    .await
    .map_err(Into::into)
}

#[derive(Debug, Validate, Serialize, Deserialize)]
pub struct CreateAppData {
  #[validate(
    length(min = 1, max = 255, message = "应用 URL 长度不得超过 255 个字符"),
    url(message = "应用 URL 格式不合法")
  )]
  url: String,
  #[validate(length(min = 1, max = 30, message = "应用名称长度不得超过 30 个字符"))]
  name: String,
  #[validate(length(min = 1, max = 255, message = "应用描述长度不得超过 255 个字符"))]
  description: Option<String>,
  #[validate(length(min = 1, max = 255, message = "应用图标长度不得超过 255 个字符"))]
  icon: Option<String>,
}

pub async fn create_app(
  db: &DbConn,
  operator_id: i64,
  data: &CreateAppData,
) -> Result<apps::Model, AppError> {
  let app_pages = apps::Entity::find()
    .filter(apps::Column::OwnerId.eq(operator_id))
    .paginate(db, 1);
  let total = app_pages.num_items().await?;

  apps::ActiveModel {
    name: Set(data.name.clone()),
    url: Set(data.url.clone()),
    icon: Set(data.icon.clone()),
    description: Set(data.description.clone()),
    index: Set(total as i32),
    owner_id: Set(operator_id),
    ..Default::default()
  }
  .insert(db)
  .await
  .map_err(Into::into)
}

#[derive(Debug, Validate, Serialize, Deserialize)]
pub struct UpdateAppData {
  #[serde(deserialize_with = "str_to_i64")]
  id: i64,
  #[validate(
    length(min = 1, max = 255, message = "应用 URL 长度不得超过 255 个字符"),
    url(message = "应用 URL 格式不合法")
  )]
  url: String,
  #[validate(length(min = 1, max = 30, message = "应用名称长度不得超过 30 个字符"))]
  name: String,
  #[validate(length(min = 1, max = 255, message = "应用描述长度不得超过 255 个字符"))]
  description: Option<String>,
  #[validate(length(min = 1, max = 255, message = "应用图标长度不得超过 255 个字符"))]
  icon: Option<String>,
}

pub async fn update_app(
  db: &DbConn,
  operator_id: i64,
  data: &UpdateAppData,
) -> Result<apps::Model, AppError> {
  let mut app = apps::Entity::find_by_id(data.id)
    .filter(apps::Column::OwnerId.eq(operator_id))
    .one(db)
    .await?
    .ok_or(AppError::new(StatusCode::NOT_FOUND, 404, "应用不存在"))?
    .into_active_model();

  app.name = Set(data.name.clone());
  app.url = Set(data.url.clone());
  app.description = Set(data.description.clone());
  app.icon = Set(data.icon.clone());

  app.update(db).await.map_err(Into::into)
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub struct SortAppData {
  #[serde(deserialize_with = "str_to_i64")]
  id: i64,
}

pub async fn sort_app(
  db: &DbConn,
  operator_id: i64,
  data: &Vec<SortAppData>,
) -> Result<(), AppError> {
  let sort_app_data = data.clone();
  db.transaction::<_, (), DbErr>(|txn| {
    Box::pin(async move {
      for (index, &item) in sort_app_data.iter().enumerate() {
        let mut app = apps::Entity::find_by_id(item.id)
          .filter(apps::Column::OwnerId.eq(operator_id))
          .one(txn)
          .await?
          .ok_or(DbErr::Custom("未查找到对应数据".to_string()))?
          .into_active_model();

        app.index = Set(index as i32);

        app.update(txn).await?;
      }

      Ok(())
    })
  })
  .await
  .map_err(AppError::from_err)?;

  Ok(())
}

pub async fn delete_app(
  db: &DbConn,
  operator_id: i64,
  app_id: i64,
) -> Result<DeleteResult, AppError> {
  apps::Entity::find_by_id(app_id)
    .filter(apps::Column::OwnerId.eq(operator_id))
    .one(db)
    .await?
    .ok_or(AppError::new(StatusCode::NOT_FOUND, 404, "应用不存在"))?
    .delete(db)
    .await
    .map_err(Into::into)
}
