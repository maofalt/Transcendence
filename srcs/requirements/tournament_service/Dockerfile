FROM python:3.10-slim

# set environment variables to see all output from python
ENV PYTHONUNBUFFERED 1

WORKDIR /app

COPY ./app/requirements.txt /app/requirements.txt

RUN apt-get update && \
    apt-get install -y libpq-dev && \
    rm -rf /var/lib/apt/lists/*

RUN pip install -r requirements.txt
RUN pip install Django djangorestframework psycopg2-binary

COPY ./app /app

EXPOSE 8001

CMD python manage.py runserver 0.0.0.0:8001
