FROM kong/kong:3.9.1
COPY ./kong.yml /home/kong/temp.yml
USER 0
RUN apt-get update && apt-get install -y gettext && rm -rf /var/lib/apt/lists/*
USER kong
ENTRYPOINT envsubst < /home/kong/temp.yml > /home/kong/kong.yml && /docker-entrypoint.sh kong docker-start