use argon2::{Config, Result, Variant, Version, hash_encoded, verify_encoded};
use lazy_static::lazy_static;
use rand::{TryRngCore, rngs::OsRng};

lazy_static! {
  static ref ARGON2_HASH_CONFIG: Config<'static> = Config {
    ad: &[],
    hash_length: 32,
    lanes: 1,
    mem_cost: 4096,
    secret: &[],
    time_cost: 4,
    variant: Variant::Argon2id,
    version: Version::Version13,
  };
}

pub fn hash(password: &String) -> Result<String> {
  let mut bytes = [0u8; 32];
  OsRng
    .try_fill_bytes(&mut bytes)
    .map_err(|_| argon2::Error::SaltTooShort)?;

  hash_encoded(password.as_bytes(), &bytes, &ARGON2_HASH_CONFIG)
}

pub fn verify(hash: &String, password: &String) -> Result<bool> {
  verify_encoded(hash, password.as_bytes())
}
