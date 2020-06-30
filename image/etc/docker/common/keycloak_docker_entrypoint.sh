#!/usr/bin/env sh
# wait-for-postgres.sh

ADDR=${DB_ADDR:-localhost}
PORT=${DB_PORT:-5432}

/usr/bin/mkdir -p /etc/x509/https
/usr/bin/cp -f /opt/vino/common/server.cert /etc/x509/https/tls.crt
/usr/bin/cp -f /opt/vino/common/server.key /etc/x509/https/tls.key

until nc -z -w5 ${ADDR} ${PORT}; do
  sleep 5
done

exit 0;
