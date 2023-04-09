use crate::{core::proxy, errors::Result};

use actix_identity::Identity;
use actix_web::{get, web, HttpResponse, Responder};
use urlencoding::decode;
use validator::Validate;

#[get("/get")]
async fn get(_identity: Identity, data: web::Query<proxy::ProxyData>) -> Result<impl Responder> {
  let data = proxy::ProxyData {
    url: decode(&data.url)?.to_string(),
  };

  data.validate()?;

  let result = proxy::get(&data).await?;

  Ok(HttpResponse::Ok().streaming(result))
}
