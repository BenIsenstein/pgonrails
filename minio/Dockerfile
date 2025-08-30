FROM minio/minio:RELEASE.2025-07-23T15-54-02Z-cpuv1

ENTRYPOINT ["/bin/sh", "-c", "mkdir -p /data/default-bucket && exec minio \"$@\"", "--"]
CMD ["server", "/data", "--console-address", ":9001"]