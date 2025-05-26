FROM supabase/edge-runtime:v1.67.4

# Install Caddy
RUN apt-get update && apt-get install -y curl && \
    curl -fsSLo caddy.tar.gz "https://github.com/caddyserver/caddy/releases/download/v2.8.4/caddy_2.8.4_linux_amd64.tar.gz" && \
    tar -zxvf caddy.tar.gz caddy && \
    chmod +x caddy && \
    mv caddy usr/local/bin/caddy && \
    rm -rf caddy.tar.gz

# Copy app code
COPY ./functions /home/deno/functions

# Copy Caddyfile and start script
COPY ./Caddyfile /etc/caddy/Caddyfile
COPY ./start.sh /start.sh
RUN chmod +x /start.sh

# Entrypoint script launches both services
ENTRYPOINT ["/start.sh"]