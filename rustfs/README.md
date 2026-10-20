# RustFS S3 Compatible Object Store

- Read the [online docs](https://rustfs.com/docs/)
- Read the [code](https://github.com/rustfs/rustfs)

## Why not MinIO

MinIO pulled most of the community edition's features and ongoing support in
favor of their commercial AIStor product. RustFS is a Rust-native,
S3-compatible object store with an actively maintained open-source license,
so it replaced MinIO here as the default backend for Supabase Storage.

The bucket used by Storage is created on boot by the one-shot
`rustfs-createbucket` service (see `docker-compose.yml`), using the `rustfs/rc`
CLI image - the RustFS equivalent of MinIO's `mc`.
