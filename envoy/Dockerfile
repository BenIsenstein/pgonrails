FROM envoyproxy/envoy:v1.37.2

COPY ./envoy.yaml /etc/envoy/envoy.yaml
COPY ./cds.yaml /etc/envoy/cds.yaml
COPY ./lds.template.yaml /etc/envoy/lds.template.yaml
COPY ./docker-entrypoint.sh /docker-entrypoint.sh

ENTRYPOINT ["/bin/sh", "/docker-entrypoint.sh"]