FROM supabase/edge-runtime:v1.69.6

COPY ./functions /home/deno/functions

ENTRYPOINT edge-runtime start --ip $EDGE_RUNTIME_LISTEN --main-service /home/deno/functions/main