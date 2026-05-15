#!/usr/bin/env bash
set -e

mongosh "mongodb://localhost:27017" \
  --tls \
  --tlsCAFile ./certs/ca.crt \
  --tlsCertificateKeyFile ./certs/client.pem