FROM kong/kong:3.9.1
COPY ./kong.yml /home/kong/temp.yml
USER 0
RUN apk update && apk add gettext
USER kong
ENTRYPOINT envsubst < /home/kong/temp.yml > /home/kong/kong.yml && /docker-entrypoint.sh kong docker-start