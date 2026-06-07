FROM node:22

WORKDIR /app

RUN npm i -g supabase

ENTRYPOINT supabase db push --debug --yes --db-url $DB_PRIVATE_CONNECTION_STRING && npm i && npm run dev