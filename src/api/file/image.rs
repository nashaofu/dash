use super::FileInfo;
use crate::{
  core::file,
  errors::{AppError, Result},
};

use actix_identity::Identity;
use actix_multipart_extract::{File, Multipart, MultipartForm};
use actix_web::{http::StatusCode, post, HttpResponse, Responder};
use lazy_static::lazy_static;
use serde::Deserialize;
use std::collections::HashMap;

lazy_static! {
  static ref IMAGE_TYPES: HashMap<&'static str, &'static str> =
    HashMap::from([("image/png", "png"), ("image/jpeg", "jpeg")]);
}

#[derive(Debug, Deserialize, MultipartForm)]
struct UploadData {
  file: File,
}

#[post("/image/upload")]
async fn upload(identity: Identity, data: Multipart<UploadData>) -> Result<impl Responder> {
  let operator_id = identity.id().map(|id| id.parse::<i64>())??;
  let content_type = data.file.content_type.as_str();

  let extension = IMAGE_TYPES.get(content_type).ok_or(AppError::new(
    StatusCode::UNPROCESSABLE_ENTITY,
    400,
    "请上传png、jepg格式的图片",
  ))?;

  let uri = file::save(operator_id, &data.file.bytes, "image", extension)?;

  Ok(HttpResponse::Ok().json(FileInfo { uri }))
}
