FROM supabase/edge-runtime:v1.69.25

RUN apt-get update && apt-get install -y curl

COPY ./functions /home/deno/functions

ENTRYPOINT edge-runtime start --ip $EDGE_RUNTIME_LISTEN --main-service /home/deno/functions/main