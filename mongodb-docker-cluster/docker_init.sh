docker volume create mongo1-volume
docker volume create mongo2-volume
docker volume create mongo3-volume
docker volume create mongo4-volume
docker volume create mongo5-volume
docker volume create mongo6-volume
docker volume create mongo-config1-volume
docker volume create mongo-config2-volume
docker volume create mongo-config3-volume
docker volume create mongos-router-volume

docker network create cluster-network

docker compose up -d --remove-orphans

docker network connect cluster-network mongo1
docker network connect cluster-network mongo2
docker network connect cluster-network mongo3
docker network connect cluster-network mongo4
docker network connect cluster-network mongo5
docker network connect cluster-network mongo6
docker network connect cluster-network mongo-config1
docker network connect cluster-network mongo-config2
docker network connect cluster-network mongo-config3
docker network connect cluster-network mongos-router



read -r -p "Enabling first replica set wait 5 seconds or press any key to continue immediately" -t 5 -n 1 -s
docker exec -it mongo1 mongosh mongodb://127.0.0.1:27018 --eval "rs.initiate({_id : 'replica-set-0', members: [{ _id : 0, host : 'mongo1:27018' },{ _id : 1, host : 'mongo2:27018' },{ _id : 2, host : 'mongo3:27018'}]})"

read -r -p "Enabling second replica set wait 5 seconds or press any key to continue immediately" -t 5 -n 1 -s
docker exec -it mongo4 mongosh mongodb://127.0.0.1:27018 --eval "rs.initiate({_id : 'replica-set-1', members: [{ _id : 0, host : 'mongo4:27018' },{ _id : 1, host : 'mongo5:27018' },{ _id : 2, host : 'mongo6:27018'}]})"

read -r -p "Enabling config server replica set wait 5 seconds or press any key to continue immediately" -t 5 -n 1 -s
docker exec -it mongo-config1 mongosh mongodb://127.0.0.1:27019 --eval "rs.initiate({_id : 'config-replica-set', members: [{ _id : 0, host : 'mongo-config1:27019' },{ _id : 1, host : 'mongo-config2:27019' },{ _id : 2, host : 'mongo-config3:27019'}]})"

read -r -p "Adding shard replica set 5 seconds or press any key to continue immediately" -t 5 -n 1 -s
docker exec -it mongos-router mongosh --eval "sh.addShard('replica-set-0/mongo1:27018,mongo2:27018,mongo3:27018')" # not working, enable shard cluster manually

read -r -p "Adding shard replica set wait 5 seconds or press any key to continue immediately" -t 5 -n 1 -s
docker exec -it mongos-router mongosh --eval "sh.addShard('replica-set-1/mongo4:27018,mongo5:27018,mongo6:27018')" # not working, enable shard cluster manually

exit
