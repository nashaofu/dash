use serde::{de::Error, Deserialize, Deserializer};

pub fn str_to_i64<'de, D>(deserializer: D) -> Result<i64, D::Error>
where
  D: Deserializer<'de>,
{
  String::deserialize(deserializer)?
    .parse::<i64>()
    .map_err(Error::custom)
}
