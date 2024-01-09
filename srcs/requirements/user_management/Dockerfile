FROM python:3.10

ENV PYTHONUNBUFFERED 1

WORKDIR /app

COPY ./conf/requirements.txt /app/requirements.txt

RUN apt-get update && \
    apt-get install -y libpq-dev && \
    apt-get install -y redis-server && \
    apt-get install libmodsecurity-dev && \
    rm -rf /var/lib/apt/lists/* && \
    pip install -r requirements.txt

RUN pip install -r requirements.txt
RUN pip install Django djangorestframework psycopg2-binary

COPY . /app

EXPOSE 8000

CMD python manage.py runserver 0.0.0.0:8000
