# Dockerfile for Node.js
FROM node:19-bullseye-slim

RUN apt-get update && apt-get install -y tini openssl

RUN which tini

WORKDIR /app

# Installer les dépendances du projet

COPY package*.json ./
RUN npm install

RUN		mkdir -p /etc/game/ssl/
RUN		openssl req -x509 -nodes -out /etc/game/ssl/game.localhost.crt -keyout \
		/etc/game/ssl/game.localhost.key -subj "/C=FR/ST=IDF/L=Paris/O=42/OU=42/CN=game.localhost/UID=znogueir@student.42.fr"

RUN		openssl req -x509 -nodes -out /etc/game/ssl/game.crt -keyout \
		/etc/game/ssl/game.key -subj "/C=FR/ST=IDF/L=Paris/O=42/OU=42/CN=game/UID=znogueir@student.42.fr"

# Copier les fichiers du projet dans le répertoire de travail du conteneur
COPY src/ src/

EXPOSE 3000

ENTRYPOINT ["tini", "--"]
CMD ["npm", "start"]