# Dockerfile for Node.js
FROM node:19-bullseye

RUN apt-get update && apt-get install -y tini

WORKDIR /app/src
COPY . .

RUN npm install

EXPOSE 3000

CMD ["node", "server.js"]