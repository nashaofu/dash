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
            ColumnDef::new(Users::Username)
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
          .col(ColumnDef::new(Users::Setting).json().null())
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
          .col(ColumnDef::new(Apps::Index).integer().not_null())
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

    let db = manager.get_connection();

    let password = crypto::hash(&"password".to_string()).unwrap();

    users::ActiveModel {
      username: Set("username".to_owned()),
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
  Username,
  Password,
  Avatar,
  Setting,
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
  Index,
  OwnerId,
  CreatedAt,
  DeletedAt,
}
