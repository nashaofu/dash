use crate::{core::setting, errors::Result};

use actix_identity::Identity;
use actix_web::{get, put, web, HttpResponse, Responder};
use sea_orm::DbConn;
use validator::Validate;

#[get("/get")]
async fn get(identity: Identity, db: web::Data<DbConn>) -> Result<impl Responder> {
  let operator_id = identity.id().map(|id| id.parse::<i64>())??;

  let setting = setting::get(&db, operator_id).await?;

  Ok(HttpResponse::Ok().json(setting))
}

#[put("/update")]
async fn update(
  identity: Identity,
  db: web::Data<DbConn>,
  data: web::Json<setting::UpdateSettingData>,
) -> Result<impl Responder> {
  data.validate()?;
  let operator_id = identity.id().map(|id| id.parse::<i64>())??;

  let setting = setting::update_setting(&db, operator_id, &data).await?;

  Ok(HttpResponse::Ok().json(setting))
}
