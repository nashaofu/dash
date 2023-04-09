use super::{FileInfo, UploadData};
use crate::{core::file, errors::Result};

use actix_identity::Identity;
use actix_multipart_extract::Multipart;
use actix_web::{post, HttpResponse, Responder};

#[post("/image/upload")]
async fn upload(identity: Identity, data: Multipart<UploadData>) -> Result<impl Responder> {
  let operator_id = identity.id().map(|id| id.parse::<i64>())??;
  let extension = data.file.name.split(".").last().unwrap_or("png");

  let uri = file::save(operator_id, &data.file.bytes, "image", extension)?;

  Ok(HttpResponse::Ok().json(FileInfo { uri }))
}
