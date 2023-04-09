use crate::errors::AppError;

use actix_web::web;
use futures_core::Stream;
use reqwest;
use serde::Deserialize;
use validator::Validate;

#[derive(Debug, Validate, Deserialize)]
pub struct ProxyData {
  #[validate(
    length(min = 1, max = 255, message = "应用 URL 长度不得超过 255 个字符"),
    url(message = "应用 URL 格式不合法")
  )]
  pub url: String,
}

pub async fn get(
  data: &ProxyData,
) -> Result<impl Stream<Item = reqwest::Result<web::Bytes>>, AppError> {
  let resp = reqwest::get(&data.url).await?;

  Ok(resp.bytes_stream())
}
