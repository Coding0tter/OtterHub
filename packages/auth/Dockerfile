FROM theultimateapp-base AS builder

ARG AUTH_PORT

WORKDIR /app/packages/auth

RUN bun run build

FROM debian:stable-slim

WORKDIR /app
COPY .env .
COPY --from=builder /app/output .
COPY --from=builder /app/node_modules/bcrypt ./node_modules/bcrypt

EXPOSE ${AUTH_PORT}

CMD ["./auth-backend"]
