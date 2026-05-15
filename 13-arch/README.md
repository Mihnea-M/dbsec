# CockroachDB + Node/Sequelize + Nginx + Redis Sentinel

## Start

```bash
docker compose down -v
docker compose up --build
```

## Test

```bash
curl http://localhost:8080/health

curl -X POST http://localhost:8080/students \
  -H 'Content-Type: application/json' \
  -d '{"name":"Ana","className":"10A"}'

curl http://localhost:8080/students
curl http://localhost:8080/students
```

The first `/students` request should use the database. The next one should use Redis cache.

## Redis Sentinel failover test

```bash
docker compose stop redis-master
curl http://localhost:8080/students
```

Sentinel should promote one replica. The app connects through Sentinel using `ioredis`.
