#/bin/bash

cd /app/src

npm install

# openssl req -x509 -nodes -out /etc/game/ssl/game.localhost.crt \
#         -keyout /etc/game/ssl/game.localhost.key \
#         -subj "/C=FR/ST=IDF/L=Paris/O=42/OU=42/CN=game.localhost/UID=znogueir@student.42.fr"

# openssl req -x509 -nodes -out /etc/game/ssl/game.crt \
#         -keyout /etc/game/ssl/game.key \
#         -subj "/C=FR/ST=IDF/L=Paris/O=42/OU=42/CN=game/UID=znogueir@student.42.fr"

exec npm start