FROM node:22

WORKDIR /app

ENTRYPOINT npm i && npm run dev