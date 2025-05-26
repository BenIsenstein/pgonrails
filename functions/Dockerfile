FROM supabase/edge-runtime:v1.67.4

COPY ./functions /home/deno/functions

CMD ["start", "--main-service", "/home/deno/functions/main"]