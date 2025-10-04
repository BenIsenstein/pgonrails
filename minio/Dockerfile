FROM minio/minio:RELEASE.2025-07-23T15-54-02Z-cpuv1

ENTRYPOINT mkdir -p /data/$STORAGE_S3_BUCKET && exec minio server /data --console-address :9001