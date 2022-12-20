use crate::{
  errors::{AppError, Result},
  settings::SETTINGS,
};

use chrono::Utc;
use std::{fmt::Display, fs};

pub fn save<T: Display, E: Display>(
  user_id: i64,
  bytes: &Vec<u8>,
  file_type: T,
  extension: E,
) -> Result<String> {
  let time = Utc::now();

  let dirname = format!("{}/{}/{}", file_type, user_id, time.format("%Y%m%d"));
  let filename = format!("{}.{}", time.format("%H%M%S%6f"), extension);
  let uri = format!("{}/{}", dirname, filename);

  let dirname = SETTINGS.files_dir.join(dirname);
  fs::create_dir_all(&dirname)
    .and_then(|_| fs::write(dirname.join(filename), &bytes))
    .map_err(AppError::from_err)?;

  Ok(uri)
}
