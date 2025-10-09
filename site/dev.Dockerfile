FROM oven/bun:1.2.23

WORKDIR /app

ENTRYPOINT bun install && bun --bun run dev