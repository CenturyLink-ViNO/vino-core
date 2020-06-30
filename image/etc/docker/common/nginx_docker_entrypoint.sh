#!/usr/bin/env bash

echo "removing default config"
rm -rf /etc/nginx/conf.d
rm -rf /etc/nginx/default.d

echo "creating links to correct config"
cp -r -f /opt/vino/conf/${NGINX_DIR}/conf.d /etc/nginx/conf.d
cp -r -f /opt/vino/conf/${NGINX_DIR}/default.d /etc/nginx/default.d

exec "$@"