FROM postgres:latest

EXPOSE 5433
# Copy custom pg_hba.conf to the container
COPY ./conf/pg_hba.conf /etc/postgresql/14/main/pg_hba.conf