-- NOTE: change to your own passwords for production environments
\set authenticator_password `echo "$DB_AUTHENTICATOR_PASSWORD"`
\set pgbouncer_password `echo "$DB_PGBOUNCER_PASSWORD"`
\set auth_password `echo "$DB_AUTH_PASSWORD"`
\set webhooks_password `echo "$DB_WEBHOOKS_PASSWORD"`
\set storage_password `echo "$DB_STORAGE_PASSWORD"`

ALTER USER authenticator WITH PASSWORD :'authenticator_password';
ALTER USER pgbouncer WITH PASSWORD :'pgbouncer_password';
ALTER USER supabase_auth_admin WITH PASSWORD :'auth_password';
ALTER USER supabase_functions_admin WITH PASSWORD :'webhooks_password';
ALTER USER supabase_storage_admin WITH PASSWORD :'storage_password';
