use anyhow::{Ok, Result};
use config::Config;
use lazy_static::lazy_static;
use serde::Deserialize;
use std::{
  env,
  fs::{self, OpenOptions},
  path::PathBuf,
};

lazy_static! {
  // 数据目录
  pub static ref DATA_DIR: PathBuf = env::current_dir().map(|current_dir| current_dir.join(&env::var("DATA_DIR").unwrap_or(String::from("data")))).expect("Get DATA_DIR Failed").to_path_buf();

  pub static ref SETTINGS: Settings = Settings::init().expect("Settings init failed");
}

#[derive(Debug, Deserialize)]
pub struct Database {
  // 数据库地址
  pub url: String,
}

impl Default for Database {
  fn default() -> Self {
    Database {
      url: format!("sqlite://{}", DATA_DIR.join("database.db").display()),
    }
  }
}

#[derive(Debug)]
pub struct Settings {
  pub port: u16,
  // 数据库地址
  pub database: Database,
  pub data_dir: PathBuf,
  pub files_dir: PathBuf,
}

impl Settings {
  pub fn init() -> Result<Self> {
    let config_file = DATA_DIR.join("settings.toml").display().to_string();
    let config = Config::builder()
      .add_source(config::File::with_name(&config_file).required(false))
      .build()?;

    let port = config.get::<u16>("port").unwrap_or(3000);

    let database = config
      .get::<Database>("database")
      .unwrap_or(Database::default());

    let settings = Settings {
      port,
      database,
      data_dir: DATA_DIR.to_path_buf(),
      files_dir: DATA_DIR.join("files"),
    };

    settings.init_dir()?;

    Ok(settings)
  }

  pub fn init_dir(&self) -> Result<()> {
    fs::create_dir_all(&self.data_dir)?;
    fs::create_dir_all(&self.files_dir)?;

    // 如果是sqlite，则初始化文件
    self
      .database
      .url
      .strip_prefix("sqlite://")
      .and_then(|database_path| {
        OpenOptions::new()
          .write(true)
          .create(true)
          .open(database_path)
          .ok()
      });

    Ok(())
  }
}
