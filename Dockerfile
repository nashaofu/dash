FROM debian:stable-slim

WORKDIR /opt/dash

COPY target/release/dash .
COPY client/dist www
COPY settings.example.toml data/settings.toml

EXPOSE 8080

ENV RUST_LOG=info \
  RUST_BACKTRACE=1 \
  DATA_DIR=/opt/dash/data

CMD ["/opt/dash/dash"]
