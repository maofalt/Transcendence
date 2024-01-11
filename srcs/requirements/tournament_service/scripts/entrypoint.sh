#!/bin/sh

while ! nc -z tounrament_db 5432; do
  sleep 1
done

# Apply database migrations
python manage.py migrate

# Start your Django app
python manage.py runserver 0.0.0.0:8001
