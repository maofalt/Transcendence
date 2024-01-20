FROM python:3.10

ENV PYTHONUNBUFFERED 1

WORKDIR /app

COPY ./conf/requirements.txt /app/requirements.txt
COPY ./conf/entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

RUN apt-get update && \
    apt-get install -y libpq-dev netcat-traditional && \
    rm -rf /var/lib/apt/lists/*

RUN pip install -r requirements.txt
# RUN pip install djangorestframework-simplejwt

# COPY . /app

EXPOSE 8000

# CMD ["python", "manage.py" "runserver", "0.0.0.0:8000"]
CMD ["bash", "/entrypoint.sh"]
