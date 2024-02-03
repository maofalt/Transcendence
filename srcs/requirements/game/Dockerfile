# Dockerfile for Node.js
FROM node:20-bullseye-slim

RUN apt-get update && apt-get install -y tini openssl && npm install -g npm@10.2.5

WORKDIR /app

COPY ./startup-game.sh ./

EXPOSE 3000

ENTRYPOINT ["tini", "--"]
CMD ["bash", "startup-game.sh"]