# ---------- Build Stage ----------
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy the rest of the app and build
COPY . .
RUN npm run build

# ---------- Serve Stage ----------
FROM caddy:2-alpine

# Set static site directory
COPY --from=builder /app/dist /usr/share/caddy

# Provide Caddyfile (or use default config)
COPY Caddyfile /etc/caddy/Caddyfile
