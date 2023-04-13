#!/usr/bin/env ash

# https://stackoverflow.com/a/9893727
set -e

case $TARGETARCH in
"amd64")
  target="x86_64-unknown-linux-musl"
  ;;
"arm64")
  target="aarch64-unknown-linux-musl"
  ;;
*)
  echo "Unsupported arch"
  exit 1
  ;;
esac

apk update
apk add build-base
rustup target add ${target}
rustup toolchain install stable-${target}

cargo build --release --target ${target}
mv target/${target}/release/dash dash
strip -x ./dash
