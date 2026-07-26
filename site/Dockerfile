# AI: Production Dockerfile for TanStack Start app.
# Uses Nitro (the official TanStack Start deployment layer) which bundles
# the app into .output/ with srvx under the hood for Node.js serving.
# See: https://tanstack.com/start/latest/docs/framework/react/guide/hosting
FROM node:22-slim AS base
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# Build
FROM deps AS build
COPY . .
RUN pnpm build

# Production — minimal image with just the Nitro output
FROM node:22-slim AS production
WORKDIR /app
COPY --from=build /app/.output ./.output

EXPOSE 3001
ENV PORT=3001
CMD ["node", ".output/server/index.mjs"]
