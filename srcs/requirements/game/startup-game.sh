#/bin/bash

cd /app/src

npm install

exec npm run "$1"
