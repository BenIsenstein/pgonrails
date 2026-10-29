FROM rustfs/rustfs:1.0.1

# The image defaults to USER rustfs (uid 10001). That's fine for a Docker
# named volume (Docker chowns it to match on first use), but platforms that
# bind-mount a host-owned directory for persistent volumes (e.g. Railway)
# hand the container a /data it can't write to - the entrypoint's own
# mkdir+chown-on-create logic only fires when the directory doesn't exist
# yet, which it already does. Run as root so startup always has permission
# to write (and let the entrypoint's own chown logic self-heal ownership on
# a genuinely fresh volume too).
USER root
