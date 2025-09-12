FROM node:20

WORKDIR /app

ENTRYPOINT npm i && npm run dev