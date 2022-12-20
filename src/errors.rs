use actix_web::{body::BoxBody, http::StatusCode, HttpResponse, ResponseError};
use sea_orm::DbErr;
use serde::Serialize;
use std::{error::Error, fmt, num::ParseIntError, result};
use validator::ValidationErrors;

pub type Result<T, E = AppError> = result::Result<T, E>;

#[derive(Debug)]
pub struct AppError {
  pub status: StatusCode,
  pub code: u16,
  pub message: String,
}

impl fmt::Display for AppError {
  // This trait requires `fmt` with this exact signature.
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    write!(f, "AppError{:?}", self)
  }
}

#[derive(Serialize, Debug)]
pub struct AppErrorJson {
  pub code: u16,
  pub message: String,
}

impl AppError {
  pub fn new<M: ToString>(status: StatusCode, code: u16, message: M) -> Self {
    AppError {
      status,
      code,
      message: message.to_string(),
    }
  }

  pub fn from_err<E: Error>(err: E) -> Self {
    AppError::new(StatusCode::INTERNAL_SERVER_ERROR, 500, err.to_string())
  }
}

impl ResponseError for AppError {
  fn status_code(&self) -> StatusCode {
    self.status
  }

  fn error_response(&self) -> HttpResponse<BoxBody> {
    HttpResponse::build(self.status_code()).json(AppErrorJson {
      code: self.code,
      message: self.message.clone(),
    })
  }
}

impl From<ValidationErrors> for AppError {
  fn from(err: ValidationErrors) -> Self {
    log::error!("ValidationErrors {}", err);
    AppError::new(StatusCode::UNPROCESSABLE_ENTITY, 422, err.to_string())
  }
}

impl From<DbErr> for AppError {
  fn from(err: DbErr) -> Self {
    log::error!("DbErr {}", err);
    AppError::from_err(err)
  }
}

impl From<anyhow::Error> for AppError {
  fn from(err: anyhow::Error) -> Self {
    log::error!("anyhow::Error {}", err);
    AppError::new(StatusCode::INTERNAL_SERVER_ERROR, 500, err.to_string())
  }
}

impl From<ParseIntError> for AppError {
  fn from(err: ParseIntError) -> Self {
    log::error!("ParseIntError {}", err);
    AppError::from_err(err)
  }
}
