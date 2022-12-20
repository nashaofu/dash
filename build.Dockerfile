FROM debian:stable-slim

WORKDIR /opt/dash

COPY target/release/dash .
COPY client/dist www

EXPOSE 3000

ENV RUST_LOG=info \
  RUST_BACKTRACE=1 \
  DATA_DIR=/opt/dash/data

CMD ["/opt/dash/dash"]
