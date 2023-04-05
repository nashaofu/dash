use crate::errors::AppError;

use actix_web::http::StatusCode;
use entity::users;
use sea_orm::{
  ActiveModelTrait, ColumnTrait, DbConn, EntityTrait, IntoActiveModel, QueryFilter, Set,
};
use serde::{Deserialize, Serialize};
use validator::Validate;

#[derive(Debug, Validate, Serialize, Deserialize)]
pub struct UpdateSettingData {
  theme: users::SettingTheme,
  #[validate(length(min = 1, max = 255, message = "背景图片长度不得超过 255 个字符"))]
  bg_image: Option<String>,
  #[validate(range(min = 0, max = 20, message = "背景模糊必须为 0 ~ 20 px"))]
  bg_blur: Option<i8>,
}

pub async fn update_setting(
  db: &DbConn,
  operator_id: i64,
  data: &UpdateSettingData,
) -> Result<users::Model, AppError> {
  let mut user = users::Entity::find()
    .filter(users::Column::Id.eq(operator_id))
    .one(db)
    .await?
    .ok_or(AppError::new(StatusCode::FORBIDDEN, 404, "未找到对应账号"))?
    .into_active_model();

  let setting = users::Setting {
    theme: data.theme.clone(),
    bg_image: data.bg_image.clone(),
    bg_blur: data.bg_blur,
  };

  user.setting = Set(Some(setting));

  user.update(db).await.map_err(Into::into)
}
