FROM node:22

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install supabase CLI for migrations on startup
RUN npm i -g supabase

ENTRYPOINT supabase db push --debug --yes --db-url $DB_PRIVATE_CONNECTION_STRING && pnpm install && pnpm dev --host
