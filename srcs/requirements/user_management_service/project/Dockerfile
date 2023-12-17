FROM python:3.10

ENV PYTHONUNBUFFERED 1

WORKDIR /app

COPY requirements.txt /app/requirements.txt

RUN apt-get update && \
    apt-get install -y libpq-dev && \
    rm -rf /var/lib/apt/lists/*

RUN pip install -r requirements.txt
RUN pip install Django djangorestframework psycopg2-binary

COPY . /app

CMD python manage.py runserver 0.0.0.0:8000