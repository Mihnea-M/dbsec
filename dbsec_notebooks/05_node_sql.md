# DBSEC 05 — Node.js and MySQL Access

## Repository category

- `5-node-sql/*.js`
- `5-node-sql/package.json`

## Learning goals

- Connect Node.js to MySQL with mysql2.
- Use connection pooling and error handling.
- Recognize unsafe string-built queries and use prepared statements.

## Detailed concept explanation

### Database connections from application code

Application code must authenticate to the database, send queries, handle failures, and close connections. A single connection is simple, but production
services normally use connection pools so many requests can share a controlled number of database connections.

### Prepared statements

Prepared statements separate SQL structure from user data. Instead of concatenating input into SQL, placeholders are bound as values. This prevents user
input from changing the meaning of the query.

### SSL/TLS connections

When the database connection crosses a network boundary, TLS protects credentials and query data in transit. The repository includes a Node example that
loads CA and client certificate files for an SSL connection.

## Code snippets and explanations

### Basic MySQL connection

**Source:** `5-node-sql/connection.js`

```js
import mysql from 'mysql2/promise'

const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'test',
  password: 'root'
})

const [rows, fields] = await connection.query('select * from students')
console.warn(rows)

await connection.destroy()
```

This opens a connection, runs a query, prints rows, and destroys the connection. The security issue to notice is credential handling: hard-coded
credentials are convenient for exercises but should be moved to environment variables or a secret manager in real systems.

### Connection pool pattern

**Source:** `5-node-sql/connection-pool.js`

```js
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: 'test',
  password: 'root',
  waitForConnections: true,
  connectionLimit: 10
})

let [rows, fields] = await pool.query('select * from students')
await pool.end()
```

A pool avoids repeatedly opening and closing TCP/database sessions. It also limits concurrency, which protects the database from overload.

### Unsafe query construction

**Source:** `5-node-sql/injection.js`

```js
const studentId = process.argv[2]
const [rows] = await connection.query(
  `select * from students where id = ${studentId}`
)
```

The input is inserted directly into SQL. If `studentId` contains SQL syntax instead of a number, the query structure can change. This is the core SQL
injection bug.

### Prepared placeholder query

**Source:** `5-node-sql/prepared.js`

```js
const studentId = process.argv[2]
const [rows] = await connection.execute(
  'select * from students where id = ?',
  [studentId]
)
```

The `?` placeholder marks data, not SQL syntax. The driver sends the value separately so malicious input remains a value.

### SSL connection setup

**Source:** `5-node-sql/conn-ssl.js`

```js
import fs from 'fs'
import mysql from 'mysql2/promise'

const connection = await mysql.createConnection({
  user: 'app1',
  password: 'ism',
  database: 'testdb',
  ssl: {
    ca: fs.readFileSync('./certs/ca.pem'),
    cert: fs.readFileSync('./certs/client-cert.pem'),
    key: fs.readFileSync('./certs/client-key.pem')
  }
})
```

The client authenticates and encrypts the connection using certificates. Never commit private keys for real systems; use managed secrets.

## Review checklist

- Where should credentials be stored?
- What is the difference between `query` with string concatenation and `execute` with placeholders?
- Why use a connection pool?
