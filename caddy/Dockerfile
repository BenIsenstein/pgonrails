FROM caddy:2

COPY ./Caddyfile /etc/caddy/Caddyfile

# translate the above into CMD format

CMD ["/bin/sh", "-c", "PROXY_AUTH_PASSWORD=$(caddy hash-password --plaintext \"$PROXY_AUTH_PASSWORD\") && caddy run --config /etc/caddy/Caddyfile --adapter caddyfile"]
