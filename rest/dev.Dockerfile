FROM postgrest/postgrest:v14.1

USER 0
RUN apt-get update && apt-get install -y curl 
USER 1000