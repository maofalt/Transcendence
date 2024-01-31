# Dockerfile for Node.js
FROM node:20-bullseye-slim

RUN apt-get update && apt-get install -y tini openssl && npm install -g npm@10.2.5

WORKDIR /app

# Installer les dépendances du projet

# COPY package*.json ./
# RUN npm install

COPY ./startup-game.sh ./

# RUN		mkdir -p /etc/game/ssl/

# RUN		openssl req -x509 -nodes -out /etc/game/ssl/game.localhost.crt -keyout \
# 		/etc/game/ssl/game.localhost.key -subj "/C=FR/ST=IDF/L=Paris/O=42/OU=42/CN=game.localhost/UID=znogueir@student.42.fr"

# RUN		openssl req -x509 -nodes -out /etc/game/ssl/game.crt -keyout \
# 		/etc/game/ssl/game.key -subj "/C=FR/ST=IDF/L=Paris/O=42/OU=42/CN=game/UID=znogueir@student.42.fr"

EXPOSE 3000

ENTRYPOINT ["tini", "--"]
CMD ["bash", "startup-game.sh"]