use crate::errors::AppError;

use actix_web::http::StatusCode;
use entity::users;
use sea_orm::{ColumnTrait, DbConn, EntityTrait, QueryFilter};
use serde::{Deserialize, Serialize};
use utils::crypto;
use validator::Validate;

#[derive(Debug, Validate, Serialize, Deserialize)]
pub struct LoginData {
  #[validate(length(min = 5, max = 30, message = "用户名必须为 5 - 30 个字符"))]
  username: String,
  #[validate(length(min = 8, max = 30, message = "密码长度必须为 8 - 30 个字符"))]
  password: String,
}

pub async fn login(db: &DbConn, data: &LoginData) -> Result<users::Model, AppError> {
  let user = users::Entity::find()
    .filter(users::Column::Username.eq(&data.username))
    .one(db)
    .await?
    .ok_or(AppError::new(StatusCode::UNAUTHORIZED, 404, "用户名不存在"))?;

  crypto::verify(&user.password, &data.password)
    .map_err(AppError::from_err)?
    .then_some(user)
    .ok_or(AppError::new(StatusCode::UNAUTHORIZED, 401, "密码错误"))
}
