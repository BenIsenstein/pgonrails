FROM node:22 as base

WORKDIR /app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/prod
COPY package.json package-lock.json /temp/prod/
RUN cd /temp/prod && npm ci

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS build
COPY --from=install /temp/prod/node_modules node_modules
COPY . .

ARG PORT
ARG HOSTNAME
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG SUPABASE_URL
ARG SUPABASE_SERVICE_ROLE_KEY

ENV PORT=$PORT
ENV HOSTNAME=$HOSTNAME
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV SUPABASE_URL=$SUPABASE_URL
ENV SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY

# [optional] tests & build
ENV NODE_ENV=production
RUN npm run build

FROM base AS runner

ENV SUPABASE_CLI_VERSION="v2.75.0"

# Install supabase CLI for migrations on startup
RUN apt-get update && apt-get install -y curl unzip \
  && curl -L https://github.com/supabase/cli/releases/download/${SUPABASE_CLI_VERSION}/supabase_linux_amd64.tar.gz -o supabase.tar.gz \
  && tar -xvzf supabase.tar.gz \
  && mv supabase /usr/local/bin/ \
  && rm supabase.tar.gz

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
COPY ./supabase ./supabase

# Drop privileges
USER nextjs

# Run the standalone server (server.js is emitted into the standalone folder root)
ENTRYPOINT supabase db push --debug --yes --db-url $DB_PRIVATE_CONNECTION_STRING && node server.js