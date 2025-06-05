#!/bin/bash

# exit as soon as any of these commands fail, this prevents starting a database without certificates
set -e

# Make sure there is a PGDATA variable available
if [ -z "$PGDATA" ]; then
  echo "Missing PGDATA variable"
  exit 1
fi

# unset PGHOST to force psql to use Unix socket path
# this is specific to Railway and allows
# us to use PGHOST after the init
unset PGHOST

## unset PGPORT also specific to Railway
## since postgres checks for validity of
## the value in PGPORT we unset it in case
## it ends up being empty
unset PGPORT

# For some reason postgres doesn't want to respect our DBDATA variable. So we need to replace it
sed -i -e 's/data_directory = '\''\/var\/lib\/postgresql\/data'\''/data_directory = '\''\/var\/lib\/postgresql\/data\/pgdata'\''/g' /etc/postgresql/postgresql.conf

# https://github.com/supabase/postgres/blob/c45336c611971037c2cc9fa21045870d225f80d5/Dockerfile-16
if [[ ! -e "/var/lib/postgresql/data/custom" ]]; then
  mkdir -p /var/lib/postgresql/data/custom
  chown postgres:postgres /var/lib/postgresql/data/custom
fi
# If custom directory isnt "mounted", copy any changed configs and "mount" it
if ! [[ -L "/etc/postgresql-custom" && -d "/var/lib/postgresql/data/custom" ]]; then
  yes | cp -arf /etc/postgresql-custom/* /var/lib/postgresql/data/custom
  rm -rf /etc/postgresql-custom
  ln -s /var/lib/postgresql/data/custom /etc/postgresql-custom
fi

# Make "listen_addresses" based on environment
echo "" >> /etc/postgresql/postgresql.conf
echo "listen_addresses = '${LISTEN_ADDRESSES}'" >> /etc/postgresql/postgresql.conf

# Call the entrypoint script with the
# appropriate PGHOST & PGPORT and redirect
# the output to stdout if LOG_TO_STDOUT is true
if [[ "$LOG_TO_STDOUT" == "true" ]]; then
    /usr/local/bin/docker-entrypoint.sh "$@" 2>&1
else
    /usr/local/bin/docker-entrypoint.sh "$@"
fi