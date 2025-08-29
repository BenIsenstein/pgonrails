FROM supabase/postgres:15.8.1.060

COPY ./realtime.sql /docker-entrypoint-initdb.d/migrations/99-realtime.sql
COPY ./webhooks.sql /docker-entrypoint-initdb.d/init-scripts/98-webhooks.sql
COPY ./roles.sql /docker-entrypoint-initdb.d/init-scripts/99-roles.sql
COPY ./jwt.sql /docker-entrypoint-initdb.d/init-scripts/99-jwt.sql
COPY ./_supabase.sql /docker-entrypoint-initdb.d/migrations/97-_supabase.sql
COPY ./logs.sql /docker-entrypoint-initdb.d/migrations/99-logs.sql

COPY --chmod=755 wrapper.sh /usr/local/bin/wrapper.sh

ENTRYPOINT ["wrapper.sh"]
CMD ["postgres", "-c", "config_file=/etc/postgresql/postgresql.conf", "-c", "log_min_messages=fatal", "--port=5432"]