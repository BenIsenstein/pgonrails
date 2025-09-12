# MinIO S3 Compatible Object Store

- Read the [online docs](https://docs.min.io/enterprise/aistor-object-store/)
- Read the [GitHub docs](https://github.com/minio/minio/tree/master/docs)
- Read the [code](https://github.com/minio/minio)

## Moving away from MinIO by January 2026

Just as we're approaching an MVP of PG On Rails, I've learned that MinIO recently pulled many features, as well as ongoing support, for the community edition of the object store in a move toward prioritizing their AIStor product.

My longterm vision is to make PG On Rails the best strategy for bootstrapping, building and self-hosting Supabase projects, on the Railway platform and beyond. It's clear that MinIO is no longer the best candidate in its niche to achieve this vision. Even if the only intended use is getting a development environment up and running quickly before moving to a hosted S3-compatible service, the need to find a new candidate still stands.

I will be migrating away from MinIO to an S3-compatible object store with ongoing support and funding, as soon as other priorities within the project backlog are taken care of.