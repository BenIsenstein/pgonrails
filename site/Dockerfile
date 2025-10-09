FROM oven/bun:1.2.23 AS base

WORKDIR /app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS build
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# [optional] tests & build
ENV NODE_ENV=production
RUN bun run build

FROM base AS runner

# Create a non-root user for safety
RUN groupadd --system nextjs && useradd --system --create-home --gid nextjs nextjs

# Copy the minimal standalone build produced by `next build` with output: 'standalone'
# The standalone folder includes a tiny server (server.js) and only the traced node_modules required at runtime.
# Also copy static assets and public.
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/public ./public
COPY --from=build /app/.next/static ./.next/static

# If your app needs other files (next.config.js, next-i18next locales, prisma client, env files, etc.),
# ensure you copy them here. The standalone trace usually includes runtime deps but not arbitrary files your app reads by path.
# Example:
# COPY --from=build /app/prisma ./prisma

# Drop privileges
USER nextjs

# Run the standalone server (server.js is emitted into the standalone folder root)
ENTRYPOINT bun run server.js