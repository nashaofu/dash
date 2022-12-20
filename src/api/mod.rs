mod app;
mod auth;
mod file;
mod password;
mod user;

use actix_web::web;

pub fn init(cfg: &mut web::ServiceConfig) {
  cfg
    .service(
      web::scope("/auth")
        .service(auth::login)
        .service(auth::logout),
    )
    .service(web::scope("/file").service(file::image::upload))
    .service(
      web::scope("/user")
        .service(user::info)
        .service(user::create)
        .service(user::update)
        .service(user::delete),
    )
    .service(web::scope("/password").service(password::update))
    .service(
      web::scope("/app")
        .service(app::all)
        .service(app::create)
        .service(app::update)
        .service(app::delete),
    );
}