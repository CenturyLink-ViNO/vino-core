#!/usr/bin/env bash

/usr/local/bin/docker-entrypoint.sh postgres

# Start the Postgres DB
/usr/lib/postgresql/10/bin/pg_ctl -D /var/lib/postgresql/data -o '-c listen_addresses=localhost' -w start

# If the database was already initialized we still want to run our sql srcipts to perform any schema upgrades
if [ -s "$PGDATA/PG_VERSION" ]; then
    for f in /docker-entrypoint-initdb.d/*.sql; do
        psql -U postgres -f "$f"
    done
fi
# Stop the Postgres DB
/usr/lib/postgresql/10/bin/pg_ctl -D /var/lib/postgresql/data -w stop

/bin/cp /var/lib/postgresql/data/pg_hba.conf /var/lib/postgresql/data/pg_hba.conf.vino.bak
/bin/sed -i -r -e 's/host[ \t]+all[ \t]+all[ \t]+127.0.0.1\/32[ \t]+ident/host all all 0.0.0.0\/0 md5/' /var/lib/postgresql/data/pg_hba.conf
/bin/sed -i -r -e 's/host[ \t]+all[ \t]+all[ \t]+\:\:1\/128[ \t]+ident/\# host all all \:\:1\/128 ident/' /var/lib/postgresql/data/pg_hba.conf


exec "$@"
