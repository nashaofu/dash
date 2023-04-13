FROM rust:alpine as server

WORKDIR /build

COPY . .

ARG TARGETARCH

RUN chmod +x ./build-server.sh
RUN ./build-server.sh

FROM --platform=amd64 node:alpine as client

WORKDIR /build

COPY client/package.json .
COPY client/yarn.lock .

RUN yarn install --frozen-lockfile --network-timeout 1000000

COPY client .

RUN yarn build


FROM alpine:latest

WORKDIR /opt/dash

COPY --from=server /build/dash .
COPY --from=client /build/dist www

EXPOSE 3000
VOLUME ["/opt/dash/data"]

ENV RUST_LOG=info \
  RUST_BACKTRACE=1 \
  DATA_DIR=/opt/dash/data

CMD ["/opt/dash/dash"]
