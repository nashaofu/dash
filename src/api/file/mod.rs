pub mod image;

use actix_multipart_extract::{File, MultipartForm};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize)]
pub struct FileInfo {
  uri: String,
}

#[derive(Debug, Deserialize, MultipartForm)]
pub struct UploadData {
  file: File,
}
