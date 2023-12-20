# Dockerfile for Node.js
FROM node:19-bullseye-slim

RUN apt-get update && apt-get install -y tini

RUN which tini

WORKDIR /app/src

# Installer les dépendances du projet
COPY package*.json ./
RUN npm install

# Copier les fichiers du projet dans le répertoire de travail du conteneur
COPY . .

EXPOSE 3001

ENTRYPOINT ["tini", "--"]
CMD ["npm", "start"]