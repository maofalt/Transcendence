FROM python:3.10-slim

# set environment variables to see all output from python
ENV PYTHONUNBUFFERED 1

WORKDIR /app

COPY ./app/requirements.txt /app/requirements.txt

RUN apt-get update && \
    apt-get install -y libpq-dev netcat-traditional
 #   rm -rf /var/lib/apt/lists/*

RUN pip install -r requirements.txt
RUN pip install Django djangorestframework psycopg2-binary

COPY ./app /app

# Copy the entrypoint script and give execute permissions
COPY /scripts /app
RUN chmod +x /app/entrypoint.sh

EXPOSE 8001

# Set the entrypoint script
#CMD ["bash", "entrypoint.sh"]
ENTRYPOINT ["tail", "-f", "/dev/null"]
