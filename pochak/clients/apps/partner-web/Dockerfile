# Stage 1: Build
FROM node:22-alpine AS build
RUN corepack enable
WORKDIR /app

# Copy workspace root files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY clients/packages/ clients/packages/
COPY clients/apps/partner-web/ clients/apps/partner-web/

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @pochak/partner-web build

# Stage 2: Serve
FROM nginx:alpine
COPY --from=build /app/clients/apps/partner-web/dist /usr/share/nginx/html

# SPA fallback
RUN echo 'server { \
  listen 3200; \
  root /usr/share/nginx/html; \
  index index.html; \
  location / { try_files $uri $uri/ /index.html; } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 3200
CMD ["nginx", "-g", "daemon off;"]
