use serde::Serializer;

pub fn i64_to_str<S>(val: &i64, serializer: S) -> Result<S::Ok, S::Error>
where
  S: Serializer,
{
  return serializer.serialize_str(&val.to_string());
}
