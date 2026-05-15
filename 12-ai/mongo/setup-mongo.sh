#!/usr/bin/env bash
set -e

CONTAINER="${CONTAINER:-mongo-anomaly}"

echo "Waiting for MongoDB container..."

until docker exec "$CONTAINER" mongosh --quiet --eval "db.adminCommand('ping').ok" >/dev/null 2>&1
do
  docker ps --filter "name=$CONTAINER"
  docker logs "$CONTAINER" --tail=10
  sleep 2
done

echo "Initializing replica set..."

docker exec -i "$CONTAINER" mongosh --quiet <<'JS'
try {
  rs.status()
  print("Replica set already initialized")
} catch (e) {
  rs.initiate({
    _id: "rs0",
    members: [
      { _id: 0, host: "127.0.0.1:27017" }
    ]
  })
}
JS

echo "Waiting for PRIMARY..."

until docker exec "$CONTAINER" mongosh --quiet --eval "db.hello().isWritablePrimary" | grep true >/dev/null
do
  sleep 1
done

echo "MongoDB is ready."