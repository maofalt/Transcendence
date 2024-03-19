FROM python:3.10-slim

# set environment variables to see all output from python
ENV PYTHONUNBUFFERED 1

WORKDIR /app

COPY ./config/requirements.txt /app/requirements.txt

# Copy the entrypoint script and give execute permissions
COPY ./scripts/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

RUN apt-get update && \
    apt-get install -y libpq-dev netcat-traditional
 #   rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir -r requirements.txt
# RUN pip install Django djangorestframework psycopg2-binary
RUN pip install --upgrade django djangorestframework
# COPY ./app /app

EXPOSE 8001

# Set the entrypoint script
CMD ["bash", "/entrypoint.sh"]
#ENTRYPOINT ["tail", "-f", "/dev/null"]
