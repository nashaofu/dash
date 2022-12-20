pub mod image;

use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct FileInfo {
  uri: String,
}
