#!/usr/bin/env bash
set -e

rm -rf certs
mkdir -p certs

# CA
openssl genrsa -out certs/ca.key 4096

openssl req -x509 -new -nodes \
  -key certs/ca.key \
  -sha256 \
  -days 3650 \
  -out certs/ca.crt \
  -subj "/CN=MongoDB Test CA"

# Server config with SAN
cat > certs/server.ext <<EOF
subjectAltName = DNS:mongodb,DNS:localhost,IP:127.0.0.1
extendedKeyUsage = serverAuth
EOF

# Server certificate
openssl genrsa -out certs/server.key 4096

openssl req -new \
  -key certs/server.key \
  -out certs/server.csr \
  -subj "/CN=mongodb"

openssl x509 -req \
  -in certs/server.csr \
  -CA certs/ca.crt \
  -CAkey certs/ca.key \
  -CAcreateserial \
  -out certs/server.crt \
  -days 365 \
  -sha256 \
  -extfile certs/server.ext

cat certs/server.crt certs/server.key > certs/server.pem

# Client config
cat > certs/client.ext <<EOF
extendedKeyUsage = clientAuth
EOF

# Client certificate
openssl genrsa -out certs/client.key 4096

openssl req -new \
  -key certs/client.key \
  -out certs/client.csr \
  -subj "/CN=mongo-client"

openssl x509 -req \
  -in certs/client.csr \
  -CA certs/ca.crt \
  -CAkey certs/ca.key \
  -CAcreateserial \
  -out certs/client.crt \
  -days 365 \
  -sha256 \
  -extfile certs/client.ext

cat certs/client.crt certs/client.key > certs/client.pem

chmod 644 certs/*.crt
chmod 644 certs/*.pem
chmod 600 certs/*.key

echo "Generated:"
echo "  certs/ca.crt"
echo "  certs/server.pem"
echo "  certs/client.pem"