use crate::{core::auth, errors::Result};

use actix_identity::Identity;
use actix_web::{post, web, HttpMessage, HttpRequest, HttpResponse, Responder};
use sea_orm::DbConn;
use validator::Validate;

#[post("/login")]
async fn login(
  db: web::Data<DbConn>,
  req: HttpRequest,
  data: web::Json<auth::LoginData>,
) -> Result<impl Responder> {
  data.validate()?;
  let login_user = auth::login(&db, &data).await?;

  Identity::login(&req.extensions(), login_user.id.to_string())?;

  Ok(HttpResponse::Ok().json(login_user))
}

#[post("/logout")]
async fn logout(identity: Option<Identity>) -> impl Responder {
  if let Some(id) = identity {
    id.logout();
  }
  HttpResponse::Ok()
}
