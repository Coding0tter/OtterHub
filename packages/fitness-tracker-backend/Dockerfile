FROM theultimateapp-base AS builder

ARG FITNESS_PORT

WORKDIR /app/packages/fitness-tracker-backend
RUN bun run build

FROM debian:stable-slim

WORKDIR /app
COPY .env .
COPY --from=builder /app/output .

EXPOSE ${FITNESS_PORT}

CMD ["./fitness-tracker-backend"]
