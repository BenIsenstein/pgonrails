FROM node:20

# Install Python 3 and pip which are needed by "bufferutil" library
RUN apt-get update && \
    apt-get install -y python3 python3-pip && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# COPY package*.json ./
# RUN npm i

ENTRYPOINT sh -c 'npm i && npm run dev'