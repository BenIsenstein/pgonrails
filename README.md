# Supabase Docker

This is a minimal Docker Compose setup for self-hosting Supabase. It has been tweaked to be compatible with hosting on Railway.

## Notes

It appears that the functions edge runtime docker image can only listen on IPv4 ports. I've added a Caddy proxy inside the container, to listen for traffic on the Railway project private network (IPv6 required) and forward it within the container to the edge functions runtime. This is meant to be temporary, and an issue has been opened in the edge runtime GH repo.

