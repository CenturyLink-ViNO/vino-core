#!/usr/bin/env bash

chmod +x /opt/vino/common/generate-keycloak-config.sh
find / -name "keycloak.json.tpl" -exec /opt/vino/common/generate-keycloak-config.sh {} \;

mkdir -p /opt/vino/common/releases/
cp /opt/abacus/etc/*.properties /opt/vino/common/releases/

exec "$@"
