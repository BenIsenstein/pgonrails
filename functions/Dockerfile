FROM supabase/edge-runtime:v1.69.4

COPY ./functions /home/deno/functions

CMD [ "start", "--ip", "::", "--main-service", "/home/deno/functions/main" ]