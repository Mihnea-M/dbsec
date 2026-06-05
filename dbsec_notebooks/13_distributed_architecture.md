# DBSEC 13 — Distributed Architecture with CockroachDB, Node/Sequelize, Nginx, and Redis Sentinel

## Repository category

- `13-arch/README.md`
- `13-arch/docker-compose.yml`
- `13-arch/app/src/*.js`

## Learning goals

- Understand a multi-service database architecture.
- Use CockroachDB as distributed SQL.
- Use Redis Sentinel for cache failover.
- Recognize security and reliability trade-offs.

## Detailed concept explanation

### Architecture overview

This section combines an application, CockroachDB nodes, Redis master/replicas with Sentinel, and Nginx. It demonstrates that database security is also
systems security: service discovery, failover, credentials, network exposure, caching, and reverse proxy behavior all matter.

### Distributed SQL

CockroachDB provides SQL semantics over a distributed system. This helps with resilience and scaling, but distributed systems introduce latency,
consensus, and operational complexity. Security policies must be applied consistently across nodes.

### Redis Sentinel

Redis Sentinel monitors Redis instances and promotes a replica if the master fails. This improves availability, but applications must connect through
Sentinel-aware clients and handle failover safely.

### Caching and stale data

The app caches database results in Redis. Cached responses can improve performance, but they must be invalidated when data or permissions change.

## Code snippets and explanations

### Start the architecture

**Source:** `13-arch/README.md`

```bash
docker compose up --build
curl http://localhost:8080/students
```

The stack starts through Docker Compose, and requests are sent through Nginx to the Node app. This is an end-to-end integration exercise.

### CockroachDB Sequelize model

**Source:** `13-arch/app/src/db.js`

```js
import SequelizeCockroachDB from 'sequelize-cockroachdb'

export const sequelize = new SequelizeCockroachDB(process.env.DATABASE_URL, {
  logging: false
})

export const Student = sequelize.define('Student', {
  name: {
    type: SequelizeCockroachDB.STRING,
    allowNull: false
  },
  className: {
    type: SequelizeCockroachDB.STRING,
    allowNull: false
  }
})
```

The application reads its database URL from the environment and defines a Student model. Environment variables are better than hard-coded connection
strings, but secrets still need secure injection.

### Redis Sentinel client

**Source:** `13-arch/app/src/cache.js`

```js
import Redis from 'ioredis'

const redis = new Redis({
  sentinels: parseSentinels(process.env.REDIS_SENTINELS),
  name: process.env.REDIS_MASTER_NAME
})
```

The client discovers the current Redis master through Sentinel. This allows the application to continue after a master failure.

### Cache wrapper idea

**Source:** `13-arch/app/src/cache.js`

```js
export async function getCached(key, loader) {
  const cached = await redis.get(key)
  if (cached) {
    return { source: 'cache', value: JSON.parse(cached) }
  }

  const value = await loader()
  await redis.set(key, JSON.stringify(value))
  return { source: 'db', value }
}
```

The function reads from cache first; on miss, it loads from the database and stores the result. Add TTLs and invalidation for real systems.

## Review checklist

- Which parts of the architecture affect security?
- What happens if Redis fails over?
- Why can cached authorization-dependent data be dangerous?
