FROM node:20-alpine AS builder

WORKDIR /app/clients/apps/public-web

# Install deps
COPY apps/public-web/package.json apps/public-web/package-lock.json* ./
RUN npm ci

# Copy shared types (must be at ../../shared relative to public-web)
COPY shared/ /app/clients/shared/

# Copy app source
COPY apps/public-web/ ./
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/clients/apps/public-web/dist /usr/share/nginx/html
COPY --from=builder /app/clients/apps/public-web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3200

CMD ["nginx", "-g", "daemon off;"]
