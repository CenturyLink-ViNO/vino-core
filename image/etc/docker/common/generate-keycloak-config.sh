#!/bin/bash

realm="${KEYCLOAK_REALM}"
url="${KEYCLOAK_PROTOCOL}://${KEYCLOAK_HOST}/auth"
resourceId="${KEYCLOAK_CLIENT_ID}"
secret="${KEYCLOAK_CLIENT_SECRET}"

dir=$(dirname "$1")

file="${dir}/keycloak.json"

echo "" > $file

while read line
do
    eval echo "$line" >> $file
done < "$1"

exit 0

