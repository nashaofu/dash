use crate::errors::AppError;

use entity::settings;
use lazy_static::lazy_static;
use regex::Regex;
use sea_orm::{
  ActiveModelTrait, ColumnTrait, DbConn, EntityTrait, IntoActiveModel, QueryFilter, Set,
};
use serde::{Deserialize, Serialize};
use validator::Validate;

lazy_static! {
  static ref THEME_REGEX: Regex = Regex::new(r"^(light)|(dark)$").unwrap();
}

pub async fn get(db: &DbConn, user_id: i64) -> Result<Option<settings::Model>, AppError> {
  settings::Entity::find()
    .filter(settings::Column::OwnerId.eq(user_id))
    .one(db)
    .await
    .map_err(Into::into)
}

#[derive(Debug, Validate, Serialize, Deserialize)]
pub struct UpdateSettingData {
  #[validate(range(min = 1, max = 2, message = "主题只能为 1 或 2"))]
  theme: i8,
  #[validate(length(min = 1, max = 255, message = "背景图片长度不得超过 255 个字符"))]
  bg_image: String,
  #[validate(range(min = 0, max = 20, message = "背景模糊必须为 0 ~ 20 px"))]
  bg_blur: i8,
}

pub async fn update_setting(
  db: &DbConn,
  operator_id: i64,
  data: &UpdateSettingData,
) -> Result<settings::Model, AppError> {
  let setting = settings::Entity::find()
    .filter(settings::Column::OwnerId.eq(operator_id))
    .one(db)
    .await?
    .map(|setting| setting.into_active_model());

  if let Some(mut setting) = setting {
    setting.theme = Set(Some(data.theme));
    setting.bg_image = Set(Some(data.bg_image.clone()));
    setting.bg_blur = Set(Some(data.bg_blur));
    setting.owner_id = Set(operator_id);

    setting.update(db).await.map_err(Into::into)
  } else {
    settings::ActiveModel {
      theme: Set(Some(data.theme)),
      bg_image: Set(Some(data.bg_image.clone())),
      bg_blur: Set(Some(data.bg_blur)),
      owner_id: Set(operator_id),
      ..Default::default()
    }
    .insert(db)
    .await
    .map_err(Into::into)
  }
}
