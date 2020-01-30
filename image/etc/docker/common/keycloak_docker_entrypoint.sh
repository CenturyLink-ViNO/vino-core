#!/usr/bin/env sh
# wait-for-postgres.sh

ADDR=${DB_ADDR:-localhost}
PORT=${DB_PORT:-5432}

until nc -z -w5 ${ADDR} ${PORT}; do
  sleep 5
done

exit 0;
