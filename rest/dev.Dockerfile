FROM postgrest/postgrest:v13.0.7

USER 0
RUN apt-get update && apt-get install -y curl 
USER 1000