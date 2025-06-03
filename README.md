# Supabase Docker

This is a minimal Docker Compose setup for self-hosting Supabase. Follow the steps [here](https://supabase.com/docs/guides/hosting/docker) to get started.

## Notes

For currently unknown reasons, Kong is behaving a bit weirdly with which ports it forwards traffic to during LOCAL DEV ONLY. It behaves as expected in production. Note the following for local dev:

- Traffic is forwarded to the functions service on port 80.
- Traffic is forwarded to the studio service on port 80.

---

It appears that the functions edge runtime docker image can only listen on IPv4 ports. I've added a Caddy proxy inside the container, to listen for traffic on the Railway project private network (IPv6 required) and forward it within the container to the edge functions runtime. This is meant to be temporary, and an issue has been opened in the edge runtime GH repo.

