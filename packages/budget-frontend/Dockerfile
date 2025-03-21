FROM theultimateapp-base AS builder

WORKDIR /app/packages/budget-frontend
RUN bun run build

FROM nginx:alpine

# Copy the built files
COPY --from=builder /app/output/dist/budget /usr/share/nginx/html

# Copy the custom nginx configuration
COPY packages/budget-frontend/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 5175
CMD ["nginx", "-g", "daemon off;"]
