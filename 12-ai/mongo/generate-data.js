import { MongoClient } from 'mongodb';

// rs.initiate({
//   _id: "rs0",
//   members: [{ _id: 0, host: "localhost:27017" }]
// });

const uri = 'mongodb://127.0.0.1:27017/?replicaSet=rs0'
const client = new MongoClient(uri);

const NORMAL_ROLES = ['user', 'editor', 'viewer'];
const ANOMALOUS_ROLES = ['root', 'godmode', 'adminx'];

function randomEmail(prefix) {
  return `${prefix}${Math.floor(Math.random() * 9000) + 1000}@example.com`;
}

async function insertData() {
  await client.connect();
  const db = client.db('testdb');
  const col = db.collection('testcoll');

  // console.log("Inserting normal operations...");
  // for (let i = 0; i < 50; i++) {
  //   await col.insertOne({
  //     email: randomEmail('user'),
  //     role: NORMAL_ROLES[Math.floor(Math.random() * NORMAL_ROLES.length)],
  //     created_at: Date.now()
  //   });
  // }

  console.log("Inserting anomalous operations...");
  for (let i = 0; i < 10; i++) {
    await col.insertOne({
      email: randomEmail('attacker'),
      role: ANOMALOUS_ROLES[Math.floor(Math.random() * ANOMALOUS_ROLES.length)],
      created_at: Date.now(),
      extra: "suspicious-field"
    });
  }

  await client.close();
  console.log("Done.");
}

insertData();
