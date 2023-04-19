FROM --platform=amd64 alpine:latest as builder

WORKDIR /build

COPY build-docker.sh .

ARG TARGETARCH

RUN chmod +x ./build-docker.sh
RUN ./build-docker.sh

FROM alpine:latest

WORKDIR /opt/dash

COPY --from=builder /build/dash .

EXPOSE 3000
VOLUME ["/opt/dash/data"]

ENV RUST_LOG=info \
  RUST_BACKTRACE=1 \
  DATA_DIR=/opt/dash/data

CMD ["/opt/dash/dash"]
