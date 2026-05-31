#!/bin/sh
set -eu

: "${POSTGRES_MASTER_HOST:=postgres-master}"
: "${POSTGRES_USER:=studyrats}"
: "${REPLICATION_USER:=repl_user}"
: "${REPLICATION_PASSWORD:=repl_secret}"
: "${PGDATA:=/var/lib/postgresql/data}"

if [ ! -s "$PGDATA/PG_VERSION" ]; then
  rm -rf "$PGDATA"/*

  until pg_isready -h "$POSTGRES_MASTER_HOST" -p 5432 -U "$POSTGRES_USER"; do
    sleep 2
  done

  PGPASSWORD="$REPLICATION_PASSWORD" pg_basebackup \
    -h "$POSTGRES_MASTER_HOST" \
    -p 5432 \
    -D "$PGDATA" \
    -U "$REPLICATION_USER" \
    -v \
    -P \
    -R

  chown -R postgres:postgres "$PGDATA"
  chmod 700 "$PGDATA"
fi

exec docker-entrypoint.sh postgres -c hot_standby=on
