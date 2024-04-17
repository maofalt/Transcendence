#!/bin/sh

while ! nc -z tournament_db 5432; do
  sleep 1
done

# Apply database migrations
# python manage.py flush --no-input
python manage.py migrate --fake sessions zero
python manage.py makemigrations
python manage.py migrate --fake-initial


# Start your Django app
python manage.py runserver 0.0.0.0:8001
