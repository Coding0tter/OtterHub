FROM theultimateapp-base AS builder

WORKDIR /app/packages/fitness-tracker-frontend
RUN bun run build

FROM nginx:alpine

# Copy the built files
COPY --from=builder /app/output/dist/fitness-tracker /usr/share/nginx/html

# Copy the custom nginx configuration
COPY packages/fitness-tracker-frontend/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 5174
CMD ["nginx", "-g", "daemon off;"]
