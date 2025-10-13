#!/bin/bash

ENV_FILE="./.env"

if [ -f "$ENV_FILE" ]; then
  source "$ENV_FILE"
  echo "Environment variables loaded from $ENV_FILE"
else
  echo "Error: .env file not found at $ENV_FILE"
  exit 1
fi

cd site && supabase db push --debug --yes --db-url "postgres://postgres:$DB_SUPERUSER_PASSWORD@localhost:$DB_PORT/$DB_NAME"