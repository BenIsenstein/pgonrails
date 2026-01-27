FROM postgrest/postgrest:v14.3

USER 0
RUN apt-get update && apt-get install -y curl 
USER 1000