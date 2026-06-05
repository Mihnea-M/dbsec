# DBSEC 08 — Node.js MongoDB Driver

## Repository category

- `8-node-mongodriver/check-connection.js`
- `8-node-mongodriver/crud.js`

## Learning goals

- Connect to MongoDB from Node.js.
- Implement CRUD operations.
- Avoid unsafe query-object construction.

## Detailed concept explanation

### MongoDB driver basics

The official MongoDB driver gives low-level access to the database. You explicitly create a client, select a database, select a collection, and run CRUD
operations. This gives control but requires careful input validation.

### Credentials and authSource

The connection string in the repository uses `authSource=admin`, meaning credentials are checked against the admin database while the application works
with another database. This is common in local Docker setups.

### Query object injection

MongoDB queries are objects. If user input is merged directly into a query object, an attacker may inject operators such as `$ne` or `$gt`. Validate input
and construct query fields explicitly.

## Code snippets and explanations

### Connect to MongoDB

**Source:** `8-node-mongodriver/check-connection.js`

```js
import { MongoClient } from 'mongodb'

const url = 'mongodb://root:ism@localhost:27017?authSource=admin'
const dbName = 'ismv4'

const client = new MongoClient(url)
await client.connect()
const db = client.db(dbName)
console.log(db)
client.close()
```

The client connects using credentials, selects the `ismv4` database, and closes the connection. Move credentials out of source code for real projects.

### CRUD helper shape

**Source:** `8-node-mongodriver/crud.js`

```js
const insertStudent = async function(db, student) {
  const collection = db.collection('students')
  const result = await collection.insertOne(student)
  return result
}
```

CRUD helpers isolate database actions. Add validation before insert so callers cannot store unexpected fields or malicious nested objects.

### Safe query construction idea

**Source:** `8-node-mongodriver/crud.js`

```js
const studentNo = Number(input)
const result = await db.collection('students').findOne({ studentNo })
```

Converting to a number and placing it in a fixed field prevents user input from becoming an operator object.

## Review checklist

- What is `authSource`?
- How can MongoDB query objects be abused?
- Where should validation happen before insert/update?
