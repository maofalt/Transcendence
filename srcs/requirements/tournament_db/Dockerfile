FROM postgres:16.1

EXPOSE 5432
# Copy custom pg_hba.conf to the container
COPY ./conf/pg_hba.conf /etc/postgresql/16/main/pg_hba.conf