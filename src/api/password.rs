use crate::{core::password, errors::Result};

use actix_identity::Identity;
use actix_web::{put, web, HttpResponse, Responder};
use sea_orm::DbConn;
use validator::Validate;

#[put("/update")]
async fn update(
  identity: Identity,
  db: web::Data<DbConn>,
  data: web::Json<password::UpdatePasswordData>,
) -> Result<impl Responder> {
  data.validate()?;
  let operator_id = identity.id().map(|id| id.parse::<i64>())??;

  password::update_password(&db, operator_id, &data).await?;

  Ok(HttpResponse::Ok())
}
