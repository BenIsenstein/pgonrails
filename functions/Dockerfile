FROM supabase/edge-runtime:v1.69.6

COPY ./functions /home/deno/functions

CMD [ "start", "--ip", "::", "--main-service", "/home/deno/functions/main" ]