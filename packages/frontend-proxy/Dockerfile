FROM theultimateapp-base AS builder

ARG PROXY_PORT

WORKDIR /app/packages/frontend-proxy
RUN bun run build

FROM debian:stable-slim

WORKDIR /app
COPY .env .
COPY --from=builder /app/output .

EXPOSE ${PROXY_PORT}

CMD ["./frontend-proxy"]
