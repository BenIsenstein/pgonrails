FROM supabase/gotrue:v2.183.0

# Copy email templates into the container
COPY ./templates /home/mailer/templates

# Install lightweight file server for email templates
USER root
RUN apk add darkhttpd
USER supabase

# Run file server and auth server in parallel
ENTRYPOINT darkhttpd /home/mailer/templates --port 8080 --addr 127.0.0.1 & auth