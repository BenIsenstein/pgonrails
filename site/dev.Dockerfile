FROM node:20

WORKDIR /app

ENTRYPOINT sh -c 'npm i && npm run dev'