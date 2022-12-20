use crate::errors::AppError;

use actix_web::http::StatusCode;
use entity::users;
use lazy_static::lazy_static;
use regex::Regex;
use sea_orm::{
  entity::Set, ActiveModelTrait, ColumnTrait, Condition, DbConn, DbErr, DeleteResult, EntityTrait,
  IntoActiveModel, ModelTrait, QueryFilter, RuntimeErr::SqlxError,
};
use serde::{Deserialize, Serialize};
use utils::crypto;
use validator::Validate;

lazy_static! {
  static ref NAME_REGEX: Regex = Regex::new(r"^[a-zA-Z0-9]\w{4,29}$").unwrap();
  pub static ref PASSWORD_REGEX: Regex = Regex::new(r"^[\x21-\x7e]{8,30}$").unwrap();
}

#[derive(Debug, Validate, Serialize, Deserialize)]
pub struct LoginData {
  #[validate(length(min = 5, max = 30, message = "用户名/邮箱长度必须为 5 - 30 个字符"))]
  login: String,
  #[validate(length(min = 8, max = 30, message = "密码长度必须为 8 - 30 个字符"))]
  password: String,
}

pub async fn login(db: &DbConn, data: &LoginData) -> Result<users::Model, AppError> {
  users::Entity::find()
    .filter(
      Condition::any()
        .add(users::Column::Name.eq(&data.login))
        .add(users::Column::Email.eq(&data.login)),
    )
    .one(db)
    .await?
    .and_then(|user| {
      crypto::verify(&user.password, &data.password)
        .ok()
        .map(|_| user)
    })
    .ok_or(AppError::new(
      StatusCode::UNAUTHORIZED,
      401,
      "用户名、邮箱或密码错误",
    ))
}

pub async fn get_user_info(db: &DbConn, id: i64) -> Result<users::Model, AppError> {
  users::Entity::find_by_id(id)
    .one(db)
    .await?
    .ok_or(AppError::new(
      StatusCode::NOT_FOUND,
      404,
      "用户信息不存在",
    ))
}

#[derive(Debug, Validate, Serialize, Deserialize)]
pub struct CreateUserData {
  #[validate(regex(
    path = "NAME_REGEX",
    message = "用户名必须为字母、数字与下划线组成的 5-30 个字符，且只能由字母或数字开头"
  ))]
  name: String,
  #[validate(
    length(min = 5, max = 30, message = "邮箱长度必须为 5 - 30 个字符"),
    email(message = "邮箱格式不合法")
  )]
  email: String,
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
  #[validate(length(min = 1, max = 255, message = "用户头像长度不得超过 255 个字符"))]
  avatar: Option<String>,
}

pub async fn create_user(
  db: &DbConn,
  operator_id: i64,
  data: &CreateUserData,
) -> Result<users::Model, AppError> {
  users::Entity::find_by_id(operator_id)
    .filter(users::Column::IsAdmin.eq(true))
    .one(db)
    .await?
    .ok_or(AppError::new(StatusCode::FORBIDDEN, 403, "没有权限"))?;

  let password = crypto::hash(&data.password).map_err(AppError::from_err)?;

  users::ActiveModel {
    name: Set(data.name.clone()),
    email: Set(data.email.clone()),
    password: Set(password),
    avatar: Set(data.avatar.clone()),
    is_admin: Set(false),
    ..Default::default()
  }
  .insert(db)
  .await
  .map_err(|err| match err {
    DbErr::Query(SqlxError(_)) => {
      AppError::new(StatusCode::CONFLICT, 409, "用户名或邮箱已经被注册")
    }
    DbErr::Exec(SqlxError(_)) => {
      AppError::new(StatusCode::CONFLICT, 409, "用户名或邮箱已经被注册")
    }
    e => e.into(),
  })
}

#[derive(Debug, Validate, Serialize, Deserialize)]
pub struct UpdateUserData {
  #[validate(regex(
    path = "NAME_REGEX",
    message = "用户名必须为字母、数字与下划线组成的 5-30 个字符，且只能由字母或数字开头"
  ))]
  name: String,
  #[validate(
    length(min = 5, max = 30, message = "邮箱长度必须为 5 - 30 个字符"),
    email(message = "邮箱格式不合法")
  )]
  email: String,
  #[validate(length(min = 1, max = 255, message = "用户头像长度不得超过 255 个字符"))]
  avatar: Option<String>,
}

pub async fn update_user(
  db: &DbConn,
  operator_id: i64,
  data: &UpdateUserData,
) -> Result<users::Model, AppError> {
  let mut user = users::Entity::find_by_id(operator_id)
    .one(db)
    .await?
    .ok_or(AppError::new(StatusCode::NOT_FOUND, 404, "用户不存在"))?
    .into_active_model();

  user.name = Set(data.name.clone());
  user.email = Set(data.email.clone());
  user.avatar = Set(data.avatar.clone());

  user.update(db).await.map_err(|err| match err {
    DbErr::Query(SqlxError(_)) => {
      AppError::new(StatusCode::CONFLICT, 409, "用户名或邮箱已经被注册")
    }
    DbErr::Exec(SqlxError(_)) => {
      AppError::new(StatusCode::CONFLICT, 409, "用户名或邮箱已经被注册")
    }
    e => e.into(),
  })
}

pub async fn delete_user(
  db: &DbConn,
  operator_id: i64,
  user_id: i64,
) -> Result<DeleteResult, AppError> {
  if operator_id == user_id {
    return Err(AppError::new(StatusCode::FORBIDDEN, 403, "不能删除自己"));
  }

  users::Entity::find_by_id(operator_id)
    .filter(users::Column::IsAdmin.eq(true))
    .one(db)
    .await?
    .ok_or(AppError::new(StatusCode::FORBIDDEN, 403, "没有权限"))?;

  users::Entity::find_by_id(user_id)
    .one(db)
    .await?
    .ok_or(AppError::new(StatusCode::NOT_FOUND, 404, "用户不存在"))?
    .delete(db)
    .await
    .map_err(Into::into)
}