FROM python:3.9-slim

# set environment variables to see all output from python
ENV PYTHONUNBUFFERED 1
WORKDIR /app
COPY ./app/requirements.txt /app/requirements.txt
RUN pip install -r requirements.txt
COPY ./app /app

CMD ["python", "manage.py", "runserver, ""0.0.0.0:8000"]
