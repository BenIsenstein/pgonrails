FROM undefined

COPY ./envoy.yaml /etc/envoy/envoy.yaml
COPY ./cds.template.yaml /etc/envoy/cds.template.yaml
COPY ./lds.template.yaml /etc/envoy/lds.template.yaml
COPY ./docker-entrypoint.sh /docker-entrypoint.sh

ENTRYPOINT ["/bin/sh", "/docker-entrypoint.sh"]