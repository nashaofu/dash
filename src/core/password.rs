use crate::errors::AppError;

use actix_web::http::StatusCode;
use entity::users;
use sea_orm::{ActiveModelTrait, DbConn, EntityTrait, IntoActiveModel, Set};
use serde::{Deserialize, Serialize};
use utils::crypto;
use validator::Validate;

use super::user::PASSWORD_REGEX;

#[derive(Debug, Validate, Serialize, Deserialize)]
pub struct UpdatePasswordData {
  #[validate(length(min = 8, max = 30, message = "密码长度必须为 8 - 30 个字符"))]
  old_password: String,
  #[validate(regex(
    path = "PASSWORD_REGEX",
    message = "密码必须为 ASCII 码中的可见字符组成的 8 - 30 个字符"
  ))]
  password: String,
  #[validate(
    regex(
      path = "PASSWORD_REGEX",
      message = "重复密码必须为 ASCII 码中的可见字符组成的 8 - 30 个字符"
    ),
    must_match(other = "password", message = "重复密码与密码不一致")
  )]
  confirm_password: String,
}

pub async fn update_password(
  db: &DbConn,
  operator_id: i64,
  data: &UpdatePasswordData,
) -> Result<(), AppError> {
  let mut user = users::Entity::find_by_id(operator_id)
    .one(db)
    .await?
    .and_then(|user| {
      crypto::verify(&user.password, &data.old_password)
        .ok()
        .map(|_| user)
    })
    .ok_or(AppError::new(StatusCode::FORBIDDEN, 403, "原密码不正确"))?
    .into_active_model();

  let password = crypto::hash(&data.password).map_err(AppError::from_err)?;

  user.password = Set(password);

  user.update(db).await?;

  Ok(())
}
