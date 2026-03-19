# RELEASE.2025-04-22 = last version with full console UI
# (policies, users, access keys manageable in browser)
# RELEASE.2025-05-24+ deprecated console → AiStor Enterprise
FROM minio/minio:RELEASE.2025-04-22T22-12-26Z

RUN mkdir -p /data

ENTRYPOINT mkdir -p /data/${STORAGE_S3_BUCKET:-deposium} && exec minio server /data --address ":9000" --console-address ":9001"
