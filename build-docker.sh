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
  echo "unsupported architecture"
  exit 1
  ;;
esac

mkdir dash

wget https://github.com/nashaofu/dash/releases/latest/download/dash-${target}.zip
unzip dash-${target}.zip
mv dash-${target}/dash dash/dash
chmod +x dash/dash

wget https://github.com/nashaofu/dash/releases/latest/download/dash-client.zip
unzip dash-client.zip
mv dash-client dash/www
