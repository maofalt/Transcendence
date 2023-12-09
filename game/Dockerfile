# Dockerfile for Node.js
FROM node:19-bullseye-slim

RUN apt-get update && apt-get install -y tini

WORKDIR /app/src
COPY . .

RUN npm install

EXPOSE 3001

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server.js"]