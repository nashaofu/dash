use crate::{
  core::app::{self, SortAppData},
  errors::Result,
};

use actix_identity::Identity;
use actix_web::{delete, get, post, put, web, HttpResponse, Responder};
use sea_orm::DbConn;

#[get("/all")]
async fn all(identity: Identity, db: web::Data<DbConn>) -> Result<impl Responder> {
  let id = identity.id().map(|id| id.parse::<i64>())??;

  let apps = app::get_user_all_app(&db, id).await?;

  Ok(HttpResponse::Ok().json(apps))
}

#[post("/create")]
async fn create(
  identity: Identity,
  db: web::Data<DbConn>,
  data: web::Json<app::CreateAppData>,
) -> Result<impl Responder> {
  let operator_id = identity.id().map(|id| id.parse::<i64>())??;

  let created_app = app::create_app(&db, operator_id, &data).await?;

  Ok(HttpResponse::Ok().json(created_app))
}

#[put("/update")]
async fn update(
  identity: Identity,
  db: web::Data<DbConn>,
  data: web::Json<app::UpdateAppData>,
) -> Result<impl Responder> {
  let operator_id = identity.id().map(|id| id.parse::<i64>())??;

  let updated_app = app::update_app(&db, operator_id, &data).await?;

  Ok(HttpResponse::Ok().json(updated_app))
}

#[put("/sort")]
async fn sort(
  identity: Identity,
  db: web::Data<DbConn>,
  data: web::Json<Vec<SortAppData>>,
) -> Result<impl Responder> {
  let operator_id = identity.id().map(|id| id.parse::<i64>())??;

  app::sort_app(&db, operator_id, &data).await?;

  Ok(HttpResponse::Ok())
}

#[delete("/delete/{app_id}")]
async fn delete(
  identity: Identity,
  db: web::Data<DbConn>,
  app_id: web::Path<i64>,
) -> Result<impl Responder> {
  let operator_id = identity.id().map(|id| id.parse::<i64>())??;

  app::delete_app(&db, operator_id, *app_id).await?;

  Ok(HttpResponse::Ok())
}
