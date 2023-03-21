use crate::{core::user, errors::Result};

use actix_identity::Identity;
use actix_web::{delete, get, post, put, web, HttpResponse, Responder};
use sea_orm::DbConn;
use validator::Validate;

#[get("/info")]
async fn info(identity: Identity, db: web::Data<DbConn>) -> Result<impl Responder> {
  let id = identity.id().map(|id| id.parse::<i64>())??;

  let user_info = user::get_user_info(&db, id).await?;
  Ok(HttpResponse::Ok().json(user_info))
}

#[get("/list")]
async fn list(
  identity: Identity,
  db: web::Data<DbConn>,
  query: web::Query<user::GetUserListQuery>,
) -> Result<impl Responder> {
  let operator_id = identity.id().map(|id| id.parse::<i64>())??;

  let user_list_res = user::get_user_list(&db, operator_id, &query).await?;
  Ok(HttpResponse::Ok().json(user_list_res))
}

#[post("/create")]
async fn create(
  identity: Identity,
  db: web::Data<DbConn>,
  data: web::Json<user::CreateUserData>,
) -> Result<impl Responder> {
  data.validate()?;
  let operator_id = identity.id().map(|id| id.parse::<i64>())??;

  let created_user = user::create_user(&db, operator_id, &data).await?;

  Ok(HttpResponse::Ok().json(created_user))
}

#[put("/update")]
async fn update(
  identity: Identity,
  db: web::Data<DbConn>,
  data: web::Json<user::UpdateUserData>,
) -> Result<impl Responder> {
  data.validate()?;
  let operator_id = identity.id().map(|id| id.parse::<i64>())??;

  let updated_user = user::update_user(&db, operator_id, &data).await?;

  Ok(HttpResponse::Ok().json(updated_user))
}

#[delete("/delete/{user_id}")]
async fn delete(
  identity: Identity,
  db: web::Data<DbConn>,
  user_id: web::Path<i64>,
) -> Result<impl Responder> {
  let operator_id = identity.id().map(|id| id.parse::<i64>())??;

  user::delete_user(&db, operator_id, *user_id).await?;

  Ok(HttpResponse::Ok())
}
