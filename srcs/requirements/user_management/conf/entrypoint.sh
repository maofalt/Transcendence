#!/bin/bash

set -x 

while ! nc -z user_management_db 5432; do
	sleep 1
done

# python manage.py flush --no-input
python manage.py migrate --fake sessions zero
python manage.py makemigrations
python manage.py migrate --fake-initial

python manage.py runserver 0.0.0.0:8000