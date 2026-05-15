import { MongoClient } from 'mongodb';

const uri = 'mongodb://localhost:27017';
const dbName = 'test';
const collectionName = 'users';

const usernameInput = process.argv[2];
const passwordInput = process.argv[3];
// assumed input: node nosql-injection.js alice apple123
// hostile input: node nosql-injection.js '{ "$ne": null }' '{ "$ne": null }'


if (!usernameInput || !passwordInput) {
  console.error("Usage: node nosql_injection_demo.js <username> <password>");
  process.exit(1);
}

const client = await MongoClient.connect(uri, { useUnifiedTopology: true });
const db = client.db(dbName);
const users = db.collection(collectionName);

// Ensure test user exists
const existing = await users.findOne({ name: 'alice' });
if (!existing) {
  await users.insertOne({ name: 'alice', password: 'apple123' });
  console.log("✅ Inserted test user: alice / apple123");
}

// NOTE: This is the vulnerable query
// example: { "$ne": null }
let query;
try {
  query = {
    name: JSON.parse(usernameInput),
    password: JSON.parse(passwordInput)
  };
} catch {
  // fallback: treat as string
  query = {
    name: usernameInput,
    password: passwordInput
  };
}

console.log("🔍 Running query:", query);

const user = await users.findOne(query);

if (user) {
  console.log("✅ Login successful:", user.name);
} else {
  console.log("❌ Login failed");
}

await client.close();
