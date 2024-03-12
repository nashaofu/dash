use crate::errors::AppError;

use actix_web::http::StatusCode;
use entity::{apps, users};
use lazy_static::lazy_static;
use regex::Regex;
use sea_orm::{
  entity::Set, ActiveModelTrait, ColumnTrait, DbConn, DbErr, DeleteResult, EntityTrait,
  IntoActiveModel, ModelTrait, PaginatorTrait, QueryFilter, QueryOrder, RuntimeErr::SqlxError,
};
use serde::{Deserialize, Serialize};
use utils::crypto;
use validator::Validate;

lazy_static! {
  static ref USERNAME_REGEX: Regex = Regex::new(r"^[a-zA-Z0-9][\x21-\x7e]{4,29}$").unwrap();
  pub static ref PASSWORD_REGEX: Regex = Regex::new(r"^[\x21-\x7e]{8,30}$").unwrap();
}

pub async fn get_user_info(db: &DbConn, id: i64) -> Result<users::Model, AppError> {
  users::Entity::find_by_id(id)
    .one(db)
    .await?
    .ok_or(AppError::new(StatusCode::NOT_FOUND, 404, "用户信息不存在"))
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GetUserListQuery {
  page: Option<u64>,
  size: Option<u64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GetUserListResp {
  items: Vec<users::Model>,
  total: u64,
}

pub async fn get_user_list(
  db: &DbConn,
  operator_id: i64,
  data: &GetUserListQuery,
) -> Result<GetUserListResp, AppError> {
  users::Entity::find_by_id(operator_id)
    .filter(users::Column::IsAdmin.eq(true))
    .one(db)
    .await?
    .ok_or(AppError::new(StatusCode::FORBIDDEN, 403, "没有权限"))?;

  let user_pages = users::Entity::find()
    .order_by_asc(users::Column::CreatedAt)
    .paginate(db, data.size.unwrap_or(10));

  let items = user_pages.fetch_page(data.page.unwrap_or(1) - 1).await?;
  let total = user_pages.num_items().await?;

  Ok(GetUserListResp { items, total })
}

#[derive(Debug, Validate, Serialize, Deserialize)]
pub struct CreateUserData {
  #[validate(regex(
    path = "*USERNAME_REGEX",
    message = "用户名必须为 ASCII 码中的可见字符组成的 5-30 个字符，且只能由字母或数字开头"
  ))]
  username: String,
  #[validate(regex(
    path = "*PASSWORD_REGEX",
    message = "密码必须为 ASCII 码中的可见字符组成的 8 - 30 个字符"
  ))]
  password: String,
  #[validate(
    regex(
      path = "*PASSWORD_REGEX",
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
    username: Set(data.username.clone()),
    password: Set(password),
    avatar: Set(data.avatar.clone()),
    is_admin: Set(false),
    ..Default::default()
  }
  .insert(db)
  .await
  .map_err(|err| match err {
    DbErr::Query(SqlxError(_)) => {
      AppError::new(StatusCode::CONFLICT, 409, "用户名已经被注册")
    }
    DbErr::Exec(SqlxError(_)) => AppError::new(StatusCode::CONFLICT, 409, "用户名已经被注册"),
    e => e.into(),
  })
}

#[derive(Debug, Validate, Serialize, Deserialize)]
pub struct UpdateUserData {
  #[validate(regex(
    path = "*USERNAME_REGEX",
    message = "用户名必须为 ASCII 码中的可见字符组成的 5-30 个字符，且只能由字母或数字开头"
  ))]
  username: String,
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

  user.username = Set(data.username.clone());
  user.avatar = Set(data.avatar.clone());

  user.update(db).await.map_err(|err| match err {
    DbErr::Query(SqlxError(_)) => {
      AppError::new(StatusCode::CONFLICT, 409, "用户名已经被注册")
    }
    DbErr::Exec(SqlxError(_)) => AppError::new(StatusCode::CONFLICT, 409, "用户名已经被注册"),
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
    .await?;

  apps::Entity::delete_many()
    .filter(apps::Column::OwnerId.eq(user_id))
    .exec(db)
    .await
    .map_err(Into::into)
}
