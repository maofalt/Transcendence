FROM python:3.8-slim

COPY config/requirements.txt ./

WORKDIR /app

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "tournament.wsgi:application"]
