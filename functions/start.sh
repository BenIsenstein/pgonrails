#!/bin/sh

# Start your legacy service in the background 
# Start Caddy in the foreground

edge-runtime start --main-service /home/deno/functions/main & \
caddy run --config /etc/caddy/Caddyfile --adapter caddyfile