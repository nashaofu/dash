mod app;
mod auth;
mod proxy;
mod file;
mod password;
mod setting;
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
    .service(web::scope("/proxy").service(proxy::get))
    .service(
      web::scope("/user")
        .service(user::info)
        .service(user::list)
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
        .service(app::sort)
        .service(app::delete),
    )
    .service(web::scope("/setting").service(setting::update));
}
