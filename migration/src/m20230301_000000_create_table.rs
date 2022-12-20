use entity::users;
use sea_orm::{entity::Set, ActiveModelTrait};
use sea_orm_migration::prelude::*;
use utils::crypto;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
  async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager
      .create_table(
        Table::create()
          .table(Users::Table)
          .if_not_exists()
          .col(
            ColumnDef::new(Users::Id)
              .big_integer()
              .not_null()
              .auto_increment()
              .primary_key(),
          )
          .col(
            ColumnDef::new(Users::Name)
              .string()
              .string_len(255)
              .unique_key()
              .not_null(),
          )
          .col(
            ColumnDef::new(Users::Email)
              .string()
              .string_len(255)
              .unique_key()
              .not_null(),
          )
          .col(
            ColumnDef::new(Users::Password)
              .string()
              .string_len(255)
              .not_null(),
          )
          .col(
            ColumnDef::new(Users::Avatar)
              .string()
              .string_len(255)
              .null(),
          )
          .col(ColumnDef::new(Users::IsAdmin).boolean().not_null())
          .col(
            ColumnDef::new(Users::CreatedAt)
              .date_time()
              .not_null()
              .default(Expr::current_timestamp()),
          )
          .col(ColumnDef::new(Users::DeletedAt).date_time().null())
          .to_owned(),
      )
      .await?;

    manager
      .create_table(
        Table::create()
          .table(Apps::Table)
          .if_not_exists()
          .col(
            ColumnDef::new(Apps::Id)
              .big_integer()
              .auto_increment()
              .primary_key()
              .not_null(),
          )
          .col(
            ColumnDef::new(Apps::Name)
              .string()
              .string_len(255)
              .not_null(),
          )
          .col(
            ColumnDef::new(Apps::Url)
              .string()
              .string_len(255)
              .not_null(),
          )
          .col(
            ColumnDef::new(Apps::Description)
              .string()
              .string_len(255)
              .null(),
          )
          .col(ColumnDef::new(Apps::Icon).string().string_len(255).null())
          .col(ColumnDef::new(Apps::OwnerId).big_integer().not_null())
          .col(
            ColumnDef::new(Apps::CreatedAt)
              .date_time()
              .not_null()
              .default(Expr::current_timestamp()),
          )
          .col(ColumnDef::new(Apps::DeletedAt).date_time().null())
          .to_owned(),
      )
      .await?;

    manager
      .create_table(
        Table::create()
          .table(Settings::Table)
          .if_not_exists()
          .col(
            ColumnDef::new(Settings::Id)
              .big_integer()
              .auto_increment()
              .primary_key()
              .not_null(),
          )
          .col(ColumnDef::new(Settings::Theme).tiny_integer().null())
          .col(
            ColumnDef::new(Settings::BgImage)
              .string()
              .string_len(255)
              .null(),
          )
          .col(ColumnDef::new(Settings::BgBlur).tiny_integer().null())
          .col(ColumnDef::new(Settings::OwnerId).big_integer().not_null())
          .col(
            ColumnDef::new(Settings::CreatedAt)
              .date_time()
              .not_null()
              .default(Expr::current_timestamp()),
          )
          .col(ColumnDef::new(Settings::DeletedAt).date_time().null())
          .to_owned(),
      )
      .await?;

    let db = manager.get_connection();

    let password = crypto::hash(&"password".to_string()).unwrap();

    users::ActiveModel {
      name: Set("admin".to_owned()),
      email: Set("admin@example.com".to_owned()),
      password: Set(password.to_owned()),
      is_admin: Set(true),
      ..Default::default()
    }
    .insert(db)
    .await?;

    Ok(())
  }

  async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    manager
      .drop_table(Table::drop().table(Users::Table).to_owned())
      .await?;
    manager
      .drop_table(Table::drop().table(Apps::Table).to_owned())
      .await
  }
}

/// Learn more at https://docs.rs/sea-query#iden
#[derive(Iden)]
enum Users {
  Table,
  Id,
  Name,
  Email,
  Password,
  Avatar,
  IsAdmin,
  CreatedAt,
  DeletedAt,
}

#[derive(Iden)]
enum Apps {
  Table,
  Id,
  Name,
  Url,
  Description,
  Icon,
  OwnerId,
  CreatedAt,
  DeletedAt,
}

#[derive(Iden)]
enum Settings {
  Table,
  Id,
  Theme,
  BgImage,
  BgBlur,
  OwnerId,
  CreatedAt,
  DeletedAt,
}
