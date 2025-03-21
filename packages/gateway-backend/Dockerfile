FROM theultimateapp-base AS builder

ARG GATEWAY_PORT

WORKDIR /app/packages/gateway-backend
RUN bun run build

FROM debian:stable-slim

WORKDIR /app
COPY .env .
COPY --from=builder /app/output .

EXPOSE ${GATEWAY_PORT}

CMD ["./gateway-backend"]
