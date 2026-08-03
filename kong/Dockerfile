FROM kong/kong:3.9.3
COPY ./kong.yml /home/kong/temp.yml
COPY ./kong-entrypoint.sh /home/kong/kong-entrypoint.sh
# COPY ./server.crt /home/kong/server.crt
# COPY ./server.key /home/kong/server.key
ENTRYPOINT /home/kong/kong-entrypoint.sh