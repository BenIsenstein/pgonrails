FROM supabase/supavisor:2.5.1

COPY ./pooler.exs /etc/pooler/pooler.exs
COPY ./entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

CMD ["/entrypoint.sh"]
