FROM theultimateapp-base AS builder

WORKDIR /app/packages/dashboard-frontend
RUN bun run build

FROM nginx:alpine

# Copy the built files
COPY --from=builder /app/output/dist/dashboard /usr/share/nginx/html

# Copy the custom nginx configuration
COPY packages/dashboard-frontend/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 5173
CMD ["nginx", "-g", "daemon off;"]
