FROM debian:stable-slim

WORKDIR /opt/wego

COPY target/release/wego .
COPY client/dist www
COPY settings.example.toml data/settings.toml

RUN chmod +x wego

EXPOSE 8080

ENV RUST_LOG=info \
  RUST_BACKTRACE=1 \
  DATA_DIR=/opt/wego/data

CMD ["/opt/wego/wego"]
