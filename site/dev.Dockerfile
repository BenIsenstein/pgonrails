FROM node:22

WORKDIR /app

ENV SUPABASE_CLI_VERSION="v2.75.0"

# Install supabase CLI for migrations on startup
RUN apt-get update && apt-get install -y curl unzip \
  && curl -L https://github.com/supabase/cli/releases/download/${SUPABASE_CLI_VERSION}/supabase_linux_amd64.tar.gz -o supabase.tar.gz \
  && tar -xvzf supabase.tar.gz \
  && mv supabase /usr/local/bin/ \
  && rm supabase.tar.gz

ENTRYPOINT supabase db push --debug --yes --db-url $DB_PRIVATE_CONNECTION_STRING && npm i && npm run dev