#!/usr/bin/env bash
set -e

MYSQL_HOST="${MYSQL_HOST:-127.0.0.1}"
MYSQL_PORT="${MYSQL_PORT:-3306}"
MYSQL_ROOT_USER="${MYSQL_ROOT_USER:-root}"
MYSQL_ROOT_PASSWORD="${MYSQL_ROOT_PASSWORD:-root}"
DB_NAME="${DB_NAME:-testdb}"

REPLICA_USER="${REPLICA_USER:-replica_user}"
REPLICA_PASSWORD="${REPLICA_PASSWORD:-replica_pass}"

echo "Waiting for MySQL..."

until mysqladmin ping \
  -h "$MYSQL_HOST" \
  -P "$MYSQL_PORT" \
  -u "$MYSQL_ROOT_USER" \
  -p"$MYSQL_ROOT_PASSWORD" \
  --silent
do
  sleep 1
done

echo "Configuring MySQL users, grants, and tables..."

mysql \
  -h "$MYSQL_HOST" \
  -P "$MYSQL_PORT" \
  -u "$MYSQL_ROOT_USER" \
  -p"$MYSQL_ROOT_PASSWORD" <<SQL
CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;

CREATE USER IF NOT EXISTS '${REPLICA_USER}'@'%' IDENTIFIED WITH mysql_native_password BY '${REPLICA_PASSWORD}';
ALTER USER '${REPLICA_USER}'@'%' IDENTIFIED WITH mysql_native_password BY '${REPLICA_PASSWORD}';

GRANT REPLICATION CLIENT, REPLICATION SLAVE ON *.* TO '${REPLICA_USER}'@'%';
GRANT SELECT ON \`${DB_NAME}\`.* TO '${REPLICA_USER}'@'%';

USE \`${DB_NAME}\`;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS secret_data (
  id INT PRIMARY KEY,
  payload TEXT
);

FLUSH PRIVILEGES;

SELECT user, host, plugin
FROM mysql.user
WHERE user = '${REPLICA_USER}';

SHOW VARIABLES LIKE 'log_bin';
SHOW BINARY LOGS;
SQL

echo "MySQL setup complete."