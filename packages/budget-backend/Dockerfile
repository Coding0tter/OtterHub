FROM theultimateapp-base AS builder

ARG BUDGET_PORT

WORKDIR /app/packages/budget-backend
RUN bun run build

FROM debian:stable-slim

WORKDIR /app
COPY .env .
COPY --from=builder /app/output .

EXPOSE ${BUDGET_PORT}

CMD ["./budget-backend"]
