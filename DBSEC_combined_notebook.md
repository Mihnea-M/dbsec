# DBSEC Combined Notebook

# DBSEC 00 — Database Models, Evolution, and Security Concerns

## Repository category

- `0-models-for-databases/0-presentation.md`
- `0-models-for-databases/0-presentation-pptx-input.md`

## Learning goals

- Explain why databases are high-value security targets.
- Compare relational, document, graph, key-value, time-series, and vector data models.
- Connect data shape to validation, query design, access control, and leakage risk.

## Detailed concept explanation

### Why database models matter for security

A database model is not only a storage choice. It determines how data is represented, queried, related, indexed, validated, and protected.
A relational model makes constraints and joins explicit, which helps enforce integrity and authorization rules. A document model is more flexible,
but the same flexibility can create schema ambiguity and injection risks. Graph models are powerful for relationships but can make access control
harder because traversals may reveal indirect relationships. Key-value stores are fast and simple, but often store temporary secrets such as sessions.
Vector databases support semantic retrieval, but embeddings can leak sensitive meaning even when raw text is hidden.

### ACID, CAP, and security

ACID properties describe transactional correctness: atomicity, consistency, isolation, and durability. They matter in security because authorization,
payments, account balances, and audit logs often need all-or-nothing behavior. CAP describes the trade-off distributed systems face during network
partitions: they cannot fully guarantee both consistency and availability. A security-relevant example is stale authorization. If a user loses access
during a partition, an availability-first system may continue allowing reads from a stale replica.

### Polyglot persistence

Modern systems often combine multiple databases: MySQL for users, MongoDB for metadata, Redis for sessions, Neo4j for relationships, and a vector
database for semantic search. This is useful, but each new system adds credentials, network exposure, backup policies, monitoring, access-control
rules, and consistency boundaries. The security lesson is that architecture increases attack surface.

## Code snippets and explanations

### Polyglot persistence example

**Source:** `0-models-for-databases/0-presentation.md`

```text
MySQL: users
MongoDB: metadata
Redis: sessions
Neo4j: relationships
```

This snippet shows different data stores assigned to different responsibilities. The design is natural because each database fits a different data shape,
but it also means the application must enforce consistent identity, authorization, logging, backup, and secrets management across several systems.

### Document NoSQL injection pattern

**Source:** `0-models-for-databases/0-presentation.md`

```json
{
  "password": { "$ne": null }
}
```

In a document database, user input may become part of a query object. If an attacker can submit operators such as `$ne`, the query may check whether
the password is not null instead of comparing it to a specific password. The defense is strict input validation and constructing queries from trusted
fields rather than raw user-controlled objects.

### Bad logging example

**Source:** `0-models-for-databases/0-presentation.md`

```text
Failed login with password MySecretPassword123
```

Logs are databases too. Storing raw passwords, tokens, or personally sensitive values in logs creates secondary leakage. A safer log records event type,
user identifier, timestamp, and outcome, but not secrets.

## Review checklist

- Can you explain how data shape affects security controls?
- Why might stale authorization be dangerous in distributed systems?
- What new risks appear when a system uses multiple databases?


---

# DBSEC 01 — Database Design, Normalization, and Security

## Repository category

- `1-database-design/1-presentation.md`
- `1-database-design/exercises.md`
- `1-database-design/concepts`
- `1-database-design/notes`

## Learning goals

- Explain keys, relations, attributes, domains, and normal forms.
- Identify update, insertion, and deletion anomalies.
- Connect normalization, constraints, and ownership modeling to security.

## Detailed concept explanation

### Database design as a security control

Good database design prevents invalid states. If a table allows duplicate identities, ambiguous ownership, or inconsistent relationships, the application
may make unsafe authorization decisions. Constraints and normalized relations reduce the number of places where sensitive facts must be updated.

### Normalization

Normalization separates facts so each fact is stored once and dependencies are explicit. First normal form avoids repeating groups, second normal form
removes partial dependency on a composite key, and third normal form removes transitive dependencies. The point is not academic purity: it reduces
anomalies and makes security decisions easier to reason about.

### Denormalization

Denormalization deliberately duplicates data for performance or simpler reads. It can be valid, but duplicated permissions, roles, or ownership data
are dangerous because one copy may be updated while another remains stale. Denormalization should be documented, synchronized, and tested.

## Code snippets and explanations

### Core design vocabulary

**Source:** `1-database-design/concepts`

```text
relation
attribute
domain
superkey
candidate key
normal forms
```

These are the basic concepts behind relational design. A relation is a table-like structure, an attribute is a column, a domain is the allowed set of
values, and keys identify rows. Security relies on these ideas because authorization often depends on reliable identifiers and valid relationships.

### Course planning model

**Source:** `1-database-design/notes`

```text
course(id, name)
course_edition(id, course_id, year)
student(id, name)
teacher(id, name)
location(id, description)
time_slot(id, start_time, end_time, location_id)
activity(id, description, course_edition_id, time_slot_id)
```

The model separates courses from course editions, people from activities, and locations from time slots. This avoids storing the same course or location
description repeatedly and makes foreign-key enforcement possible.

### Ownership modeling question

**Source:** `1-database-design/exercises.md`

```text
Which is more dangerous:
duplicated product names or duplicated user roles?
```

Duplicated product names may cause inconsistency, but duplicated roles can become an authorization flaw. If one copy says a user is an admin and another
copy says they are not, the application may check the wrong source of truth.

## Review checklist

- Where should ownership be represented in a schema?
- What anomaly appears if user roles are duplicated?
- When is denormalization justified?


---

# DBSEC 03 — SQL Foundations, Joins, Indexes, JSON, and Transactions

## Repository category

- `3-sql/*.sql`
- `3-sql/infra/docker-compose.yml`

## Learning goals

- Understand DDL, DML, constraints, joins, aggregation, indexes, JSON columns, CTEs, and transactions.
- Recognize how SQL features support correctness and security.
- Use EXPLAIN and indexes to reason about query performance.

## Detailed concept explanation

### DDL and constraints

SQL data definition language creates the structure of the database. Primary keys identify rows; foreign keys enforce relationships; CHECK constraints
restrict invalid values. Constraints are a defense-in-depth layer because they keep the database safe even when application code has bugs.

### Queries and relationships

SELECT, WHERE, JOIN, GROUP BY, HAVING, subqueries, and CTEs let us express questions about related data. Security-sensitive applications should make
these relationships explicit, especially when checking whether a user owns or can access a resource.

### Transactions

Transactions group changes into a logical unit. If one operation fails, rollback prevents partial updates. This matters for security because permission
changes, payments, audit-log writes, and account updates must not be half-completed.

## Code snippets and explanations

### Create a typed user table

**Source:** `3-sql/1_create_table.sql`

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type ENUM('student', 'teacher') NOT NULL
) COMMENT='Stores all users, either students or teachers';
```

The primary key gives each user a stable identity. `NOT NULL` prevents missing values, and the ENUM restricts the role-like `type` field to allowed
values. This is simple schema-level validation.

### Add a CHECK constraint

**Source:** `3-sql/5_constraints.sql`

```sql
ALTER TABLE users
ADD CONSTRAINT chk_username_length CHECK (CHAR_LENGTH(username) >= 3);

INSERT INTO users (username, type) VALUES ('ab', 'student');
```

The CHECK constraint prevents invalid short usernames from entering the database. The final insert is a negative test: it should fail, showing that the
database enforces the rule independently of the application.

### Join related tables

**Source:** `3-sql/14_join.sql`

```sql
SELECT 
    d.name AS department_name,
    AVG(td.salary_per_hour) AS avg_salary_per_hour
FROM teacher_departments td
JOIN departments d ON td.department_id = d.id
GROUP BY d.name;
```

The join combines department metadata with teacher-department assignments. This is the relational pattern used for authorization checks too: connect
the resource to the user or role through explicit relationships.

### Compare query plan before and after an index

**Source:** `3-sql/16_indexes.sql`

```sql
EXPLAIN
SELECT * FROM students
WHERE name = 'Alice';

ALTER TABLE students
ADD INDEX idx_student_name (name);

EXPLAIN
SELECT * FROM students
WHERE name = 'Alice';
```

`EXPLAIN` shows how MySQL plans to execute the query. After adding the index, lookup by `name` should require less scanning. Indexes improve performance,
but they can also affect privacy if indexed sensitive fields are exposed through search or timing behavior.

### Manual transaction control

**Source:** `3-sql/22_transactions.sql`

```sql
SET autocommit = 0;
START TRANSACTION;

DELETE FROM students WHERE name = 'tim';

ROLLBACK;

SELECT * FROM students WHERE name = 'tim';
SET autocommit = 1;
```

This demonstrates rollback. The delete is undone, proving that the database can return to its previous consistent state. For security, transactions
protect against partial state changes during errors or crashes.

## Review checklist

- What does each constraint prevent?
- When should you add an index?
- Why are transactions important for auditability and recovery?


---

# DBSEC 04 — MySQL DBA Security: Users, Grants, Roles, Definers, SSL, Hashing

## Repository category

- `4-mysql-dba/*.txt`
- `3-sql/ssl/*`

## Learning goals

- Create and manage MySQL users.
- Apply least privilege with GRANT, REVOKE, and roles.
- Understand definers, SSL client authentication, manual encryption, and hashing.

## Detailed concept explanation

### Users, hosts, and privileges

In MySQL, an account is identified by both username and host, such as `'user1'@'localhost'`. Privileges should be as narrow as possible:
grant only the needed operations on only the needed schema, table, or routine. Broad grants make application compromise more damaging.

### Roles and least privilege

Roles group privileges into reusable sets. A web application may need read access to one table and write access to another, but not administrative
rights. Roles help express this policy without manually granting every permission to every user.

### Definers and stored routines

Stored procedures can run with the privileges of their definer. This can be useful for controlled privileged actions, but dangerous if users can execute
a routine that performs operations they should not normally perform. Definer routines should be minimal, reviewed, and granted carefully.

### Hashing vs encryption

Passwords should normally be hashed, not encrypted, because the application should not need to recover the original password. Encryption is reversible
and appropriate for secrets that must be read later. Hashing is one-way and should use strong password hashing in real systems; SHA2 is shown here as a
basic database function demonstration, not as best-practice password storage.

## Code snippets and explanations

### Create a user

**Source:** `4-mysql-dba/2_create user.txt`

```sql
CREATE USER 'user1'@'localhost' IDENTIFIED BY 'ism';
SELECT user FROM mysql.user;
```

This creates a MySQL account and then lists users. The host part matters: `'user1'@'localhost'` is different from `'user1'@'%'`.

### Grant and flush privileges

**Source:** `4-mysql-dba/6_grant.txt`

```sql
GRANT create, SELECT, insert, update ON role_examples.* TO 'user1'@'localhost';
GRANT drop ON role_examples.* TO 'user1'@'localhost';
FLUSH PRIVILEGES;
```

The account receives explicit privileges on the `role_examples` database. From a security perspective, `DROP` is high-impact and should not be granted
to normal application accounts unless absolutely necessary.

### Use a role

**Source:** `4-mysql-dba/9_roles.txt and 4-mysql-dba/11_role_perms.txt`

```sql
CREATE ROLE 'webapp';

GRANT SELECT ON role_examples.only_read TO 'webapp'@'%';
GRANT ALL PRIVILEGES ON role_examples.read_write1 TO 'webapp'@'%';

GRANT 'webapp'@'%' TO 'user1'@'localhost';
SET ROLE 'webapp'@'%';
```

A role is created, granted permissions, assigned to a user, and activated. This separates privilege design from individual account management.

### Definer-like privileged routine

**Source:** `4-mysql-dba/12_definers.txt`

```sql
DELIMITER //
CREATE PROCEDURE delete_only_read(IN target INT)
BEGIN
    DELETE FROM role_examples.only_read WHERE id = target;
END //
DELIMITER ;

GRANT EXECUTE ON role_examples.* TO 'webapp'@'%';
```

The routine encapsulates a delete operation and grants only execution to the application role. This can reduce direct table privileges, but it must be
designed carefully because routine execution can become a privilege-escalation path.

### Hash a password-like value

**Source:** `4-mysql-dba/16_hash.txt`

```sql
CREATE TABLE ism_passwords1 (
    id INT NOT NULL,
    pass VARCHAR(50),
    hash_value VARBINARY(512)
) ENGINE=InnoDB;

INSERT INTO ism_passwords1 (id, pass, hash_value)
VALUES (1, 'somepass', SHA2('somepass', 512));
```

The example stores a hash alongside the raw password field. In production, never store the raw password; use a password hashing algorithm with salt and
work factor, such as bcrypt, scrypt, or Argon2.

## Review checklist

- What privileges does the web application actually need?
- Why is `DROP` dangerous for an app account?
- When should you use a stored procedure instead of direct table access?


---

# DBSEC 05.1 — SQL Injection Attacks and Prevention

## Repository category

- `5.1-sql-injection/*.js`

## Learning goals

- Understand classic, blind, and time-based SQL injection.
- Understand why string comparison and timing behavior can leak information.
- Apply prepared statements and safe comparison patterns.

## Detailed concept explanation

### Classic SQL injection

Classic SQL injection happens when attacker-controlled text is inserted into a query string. Payloads such as `' OR '1'='1` can convert a login query
into one that always returns rows.

### Blind SQL injection

Blind injection is used when the application does not print query results but reveals true/false behavior. Attackers can ask yes/no questions, such as
whether the first password character is `a`, and reconstruct secrets slowly.

### Time-based injection

Time-based injection uses delays as a side channel. If a condition is true, the query sleeps; if false, it returns immediately. Even without visible
data, response time leaks information.

### Prevention

The main prevention is prepared statements. Treat user input as values, not query syntax. Also validate input types, use least-privileged database users,
avoid detailed database errors in responses, and use constant-time comparison when comparing secrets in application code.

## Code snippets and explanations

### Classic vulnerable pattern

**Source:** `5.1-sql-injection/classic-injection.js`

```js
const username = answer
const query = `SELECT * FROM users WHERE username = '${username}'`
const [rows] = await connection.execute(query)
```

The username is embedded directly into SQL. A malicious username can close the quote and add SQL operators, changing the WHERE clause.

### Blind injection idea

**Source:** `5.1-sql-injection/blind-test.js`

```js
const targetUser = 'alice'
const maxPasswordLength = 20
const charset = 'abcdefghijklmnopqrstuvwxyz0123456789'
```

The test script tries candidate characters from a charset and observes whether the database/application behavior confirms each guess. This demonstrates
how small leaks can reveal complete secrets.

### Time measurement pattern

**Source:** `5.1-sql-injection/timed-injection.js`

```js
const start = Date.now()
const [rows] = await connection.execute(query)
const end = Date.now()

console.log(`Query took ${end - start} ms`)
```

If an injected condition triggers a delay, the attacker can infer whether the condition was true by measuring response time.

### Prepared-statement prevention

**Source:** `5.1-sql-injection/prevention.js`

```js
const [results] = await connection.execute(
  'SELECT * FROM users WHERE username = ?',
  [username]
)
```

The placeholder prevents username input from becoming SQL syntax. Even if the input contains quotes or operators, it is treated as a string value.

### Constant-time comparison

**Source:** `5.1-sql-injection/safe-string-comparison.js`

```js
import crypto from 'crypto'
crypto.timingSafeEqual(Buffer.from(input), Buffer.from(actualPassword))
```

Normal string comparison may return earlier when the first differing character is found. Constant-time comparison reduces timing leaks, although buffers
must be the same length and passwords should normally be verified through password-hashing libraries.

## Review checklist

- What changes when user input is concatenated into SQL?
- How can an attacker learn secrets without seeing query output?
- Why do prepared statements block SQL injection?


---

# DBSEC 05.a — MySQL SSL/TLS Connection Setup

## Repository category

- `5.a-mysql-ssl-connection/init.sql`
- `5-node-sql/conn-ssl.js`

## Learning goals

- Understand SSL-required MySQL accounts.
- Connect a Node.js client using CA, certificate, and key files.
- Recognize certificate/key handling risks.

## Detailed concept explanation

### Why TLS matters

Database traffic can contain credentials, personal data, access-control results, and business secrets. TLS protects this data in transit and can also
authenticate the client through certificates.

### Server-side requirement

A MySQL account can be configured to require SSL. This prevents the user from connecting over plaintext. For stricter setups, X509 requirements can force
certificate-based authentication.

### Operational warning

The repository contains demo certificates for local exercises. Private keys should not be committed in real repositories. Rotate exposed credentials and
use secret stores or deployment-time injection.

## Code snippets and explanations

### Create SSL-required user

**Source:** `5.a-mysql-ssl-connection/init.sql`

```sql
CREATE DATABASE testdb;

CREATE USER 'ssluser'@'%' IDENTIFIED BY 'sslpass' REQUIRE SSL;
GRANT ALL PRIVILEGES ON testdb.* TO 'ssluser'@'%';
FLUSH PRIVILEGES;
```

The account must connect using SSL. The grant is broad for a demo; a real application should receive narrower permissions.

### Node SSL client options

**Source:** `5-node-sql/conn-ssl.js`

```js
ssl: {
  ca: fs.readFileSync('./certs/ca.pem'),
  cert: fs.readFileSync('./certs/client-cert.pem'),
  key: fs.readFileSync('./certs/client-key.pem')
}
```

The CA verifies the server certificate. The client certificate and key identify the client if mutual TLS is configured.

## Review checklist

- What does `REQUIRE SSL` enforce?
- Why should private keys not be committed?
- How is TLS different from password authentication?


---

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


---

# DBSEC 06 — Node ORM with Sequelize

## Repository category

- `6-node-orm/*.js`
- `6-node-orm/package.json`

## Learning goals

- Connect Sequelize to MySQL.
- Define models and relationships.
- Understand ORM benefits and security limitations.

## Detailed concept explanation

### What an ORM does

An Object-Relational Mapper maps JavaScript objects/classes to relational tables. It helps define models, run queries, create tables, and express
relationships without writing every SQL statement manually.

### Security benefits

ORMs often encourage parameterized queries and centralize schema definitions. This reduces some SQL injection risks and makes validation easier.
However, raw query features can still be unsafe if user input is concatenated.

### Security limitations

An ORM does not automatically solve authorization. You must still check ownership, roles, tenant boundaries, and sensitive-field exposure. ORM models
should reflect security boundaries, not just database convenience.

## Code snippets and explanations

### Create a Sequelize connection

**Source:** `6-node-orm/check-connection.js`

```js
import Sequelize from 'sequelize'

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: 'localhost',
  database: 'test',
  username: 'root',
  password: 'root'
})

await sequelize.authenticate()
await sequelize.close()
```

`authenticate()` checks whether the application can connect. In production, credentials should come from environment variables and the database user
should have limited privileges.

### Define a model

**Source:** `6-node-orm/create-tables-1.js`

```js
const Student = sequelize.define('Student', {
  firstName: Sequelize.STRING,
  lastName: Sequelize.STRING,
  email: Sequelize.STRING
})
```

The model defines table columns in JavaScript. Add validation and constraints where possible so application-level rules and database-level rules align.

### Stored procedure call through ORM

**Source:** `6-node-orm/stored-proc.js`

```js
await sequelize.query(
  'CALL concatenate_with_date(:input, @result)',
  { replacements: { input: 'hello' } }
)

const result = await sequelize.query('SELECT @result AS result', { plain: true })
```

Named replacements bind input values safely. Stored procedures can encapsulate logic, but they must be permissioned carefully.

## Review checklist

- What does Sequelize automate?
- What security work remains even when using an ORM?
- When is raw SQL through an ORM dangerous?


---

# DBSEC 07 — MongoDB Shell, Aggregation, and Lookups

## Repository category

- `7-mongo/1 - intro`
- `7-mongo/advanced-aggregation/*`

## Learning goals

- Understand MongoDB documents and collections.
- Use aggregation pipelines and `$lookup`.
- Identify security risks from flexible schemas and complex joins.

## Detailed concept explanation

### Document databases

MongoDB stores JSON-like documents in collections. Documents can contain nested objects and arrays, which makes them natural for API-shaped data.
Flexibility is useful, but inconsistent documents can make validation and authorization harder.

### Aggregation pipeline

Aggregation pipelines process documents through stages such as `$match`, `$project`, `$group`, `$lookup`, and `$unwind`. This makes MongoDB powerful for
analytics and relationship-like queries.

### $lookup and security

`$lookup` joins data from another collection. This can expose related documents, so applications must still filter by tenant, owner, and permissions.
Nested lookups are especially easy to overexpose.

## Code snippets and explanations

### Seed collections

**Source:** `7-mongo/advanced-aggregation/1-seed`

```javascript
use school_demo

db.students.drop()
db.teachers.drop()
db.classes.drop()

db.students.insertMany([
  { _id: 1, name: 'Alice', year: 1 },
  { _id: 2, name: 'Bob', year: 2 }
])
```

The seed script resets collections and inserts sample documents. This is common in teaching and testing, but destructive commands like `drop()` must
never be exposed to untrusted users or production scripts.

### Basic lookup

**Source:** `7-mongo/advanced-aggregation/2-basic-lookup`

```javascript
db.classes.aggregate([
  {
    $lookup: {
      from: 'teachers',
      let: { teacherIdFromClass: '$teacherId' },
      pipeline: [
        { $match: { $expr: { $eq: ['$_id', '$$teacherIdFromClass'] } } }
      ],
      as: 'teacher'
    }
  },
  { $unwind: '$teacher' }
])
```

The pipeline joins classes to teachers. The `$expr` comparison connects the current class's `teacherId` to a teacher `_id`.

### Nested lookup pattern

**Source:** `7-mongo/advanced-aggregation/5-nested-lookup`

```javascript
db.students.aggregate([
  {
    $lookup: {
      from: 'enrollments',
      let: { studentId: '$_id' },
      pipeline: [
        { $match: { $expr: { $eq: ['$studentId', '$$studentId'] } } }
      ],
      as: 'enrollments'
    }
  }
])
```

A student's enrollments are embedded into the result. If this were a multi-tenant system, the pipeline would also need tenant and authorization filters.

## Review checklist

- Why can flexible schemas become dangerous?
- What does `$lookup` do?
- Where should authorization filters appear in an aggregation pipeline?


---

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


---

# DBSEC 09 — Mongoose Schemas, Virtuals, Hooks, and Encryption Demo

## Repository category

- `9-node-mongoose/*.js`

## Learning goals

- Define Mongoose schemas and models.
- Use virtual fields and population.
- Understand hooks and encryption-at-rest demonstrations.

## Detailed concept explanation

### Mongoose schema layer

Mongoose adds a schema/model abstraction on top of MongoDB. Schemas define expected fields, types, defaults, validation, virtuals, hooks, and references.
This helps control MongoDB's flexibility.

### Virtuals and population

Virtual fields compute values that are not physically stored. Population resolves references between documents. Both are useful, but they can accidentally
return more data than intended if projections and access-control filters are missing.

### Hooks and encryption

Mongoose hooks run before or after operations such as save. They can transform data before storage, for example encrypting a field. This is only safe if
keys are managed properly and encryption is authenticated where integrity matters.

## Code snippets and explanations

### Basic schema

**Source:** `9-node-mongoose/create-entities.js`

```js
import mongoose from 'mongoose'

const LocationSchema = new mongoose.Schema({
  address: String,
  city: String,
  coordinates: {
    lat: Number,
    lng: Number
  }
})
```

The schema gives structure to documents. Nested fields represent location coordinates naturally, while still allowing Mongoose to validate expected types.

### Virtual full name

**Source:** `9-node-mongoose/virtual-fields.js`

```js
const userSchema = new Schema({
  firstName: String,
  lastName: String
})

userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`
})
```

The computed `fullName` is not stored in MongoDB. It is derived at read time, reducing duplicated data.

### Encryption hook pattern

**Source:** `9-node-mongoose/hooks.js`

```js
SecretSchema.pre('save', function(next) {
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv)
  this.content = Buffer.concat([
    cipher.update(this.content),
    cipher.final()
  ]).toString('hex')
  next()
})
```

A pre-save hook encrypts content before persistence. The concept is useful, but the demo-style fixed key/IV pattern should be replaced with robust key
management and authenticated encryption in production.

## Review checklist

- How does Mongoose constrain MongoDB flexibility?
- Why can population leak extra data?
- What is the danger of hard-coded encryption keys?


---

# DBSEC 10 — Redis Data Structures, Pub/Sub, Streams, and ACLs

## Repository category

- `10-redis/*.js`
- `10-redis/security/notes`

## Learning goals

- Use Redis strings, lists, sets, sorted sets, hashes, pub/sub, and streams.
- Understand Redis as cache, queue, and session store.
- Apply authentication and ACL basics.

## Detailed concept explanation

### Redis as an in-memory data store

Redis is fast because it stores data primarily in memory. It is commonly used for caching, sessions, queues, rate limiting, locks, pub/sub, and streams.
Speed makes it attractive, but sensitive temporary data can leak if Redis is exposed or unauthenticated.

### Data structures

Redis is not just key-value strings. It supports lists, sets, sorted sets, hashes, streams, and pub/sub channels. Each structure fits different access
patterns: sets for membership, sorted sets for priority queues, streams for event logs, and hashes for object-like records.

### Redis security

Redis should not be publicly exposed. Use authentication, ACLs, network restrictions, protected mode, TLS when appropriate, and careful key naming.
Avoid storing long-lived secrets unless protected with strong controls.

## Code snippets and explanations

### Strings operations

**Source:** `10-redis/strings.js`

```js
await client.set('user:name:1', 'jim')
await client.set('user:counter:1', 0)
await client.incr('user:counter:1')
let result = await client.getSet('user:name:1', 'john')
await client.append('user:name:1', ' smith')
result = await client.get('user:name:1')
```

This demonstrates basic string storage, counters, atomic increment, get-and-set, and append. Atomic operations make Redis useful for counters and rate
limits.

### Sets and intersection

**Source:** `10-redis/sets.js`

```js
await client.sAdd('assets:1', '1')
await client.sAdd('assets:1', '2')
await client.sAdd('assets:2', '1')
await client.sAdd('assets:2', '5')

let result = await client.sInter(['assets:1', 'assets:2'])
console.log(result)
```

Sets store unique members. Intersection can model shared access, overlapping permissions, common tags, or mutual membership.

### Pub/sub producer

**Source:** `10-redis/pubsub-producer.js`

```js
while (!done) {
  const value = await askQuestion('task: ')
  if (value.trim() === 'quit') break
  client.publish('tasks:1', value)
}
```

Pub/sub broadcasts messages to subscribers. It is ephemeral: if no subscriber is listening, the message is not stored.

### Stream consumer group

**Source:** `10-redis/stream-consumer.js`

```js
const response = await client.xReadGroup(groupName, consumerName, {
  key: streamKey,
  id: '>',
}, { COUNT: 10, BLOCK: 5000 })

await client.xAck(streamKey, groupName, message.id)
```

Streams persist events and consumer groups track delivery. Acknowledgement tells Redis that a message was processed.

### Redis ACL example

**Source:** `10-redis/security/notes`

```redis
CONFIG SET requirepass welcome123
AUTH default welcome123

ACL SETUSER someone on >somepass ~tests:* +@all
AUTH someone somepass

SET tests:1 somevalue
SET xxx:1 somevalue
```

The user `someone` is enabled, assigned a password, and limited to keys matching `tests:*`. The final write to `xxx:1` should be forbidden because it
does not match the key pattern.

## Review checklist

- Which Redis structure fits queues? sets? event logs?
- Why is pub/sub not durable?
- How do ACL key patterns reduce blast radius?


---

# DBSEC 10.a — Neo4j Graph Database

## Repository category

- `10.a-neo4j/commands`
- `10.a-neo4j/app/app.js`
- `10.a-neo4j/connect`

## Learning goals

- Understand graph nodes and relationships.
- Run basic Cypher queries.
- Connect Node.js to Neo4j using the official driver.

## Detailed concept explanation

### Graph model

Neo4j stores nodes and relationships. This is natural for social networks, recommendations, dependency graphs, fraud detection, access paths, and
knowledge graphs. Security checks can be graph traversals, but traversal depth and relationship visibility must be controlled.

### Cypher

Cypher is Neo4j's query language. It uses patterns such as `(a:Person)-[:KNOWS]->(b:Person)` to match relationships. Pattern matching is expressive,
but careless queries can reveal indirect relationships.

### Driver sessions

The Node.js driver creates a driver, opens a session, runs Cypher, and closes resources. Credentials and connection strings should be externalized.

## Code snippets and explanations

### Create people nodes and relationships

**Source:** `10.a-neo4j/commands`

```cypher
CREATE (a:Person {name: 'Alice', age: 30});
CREATE (b:Person {name: 'Bob', age: 25});

MATCH (a:Person {name: 'Alice'}), (b:Person {name: 'Bob'})
CREATE (a)-[:KNOWS]->(b);
```

Nodes represent people; the directed `KNOWS` relationship connects them. Graph databases make this relationship first-class rather than hidden in join
tables.

### Match relationships

**Source:** `10.a-neo4j/commands`

```cypher
MATCH (a:Person)-[r:KNOWS]->(b:Person)
RETURN a.name, r, b.name;

MATCH (p:Person)
WHERE p.age > 26
RETURN p.name, p.age;
```

The first query returns connected people. The second filters nodes by property. In secure apps, add access-control restrictions to both node and
relationship queries.

### Node.js driver connection

**Source:** `10.a-neo4j/app/app.js`

```js
import neo4j from 'neo4j-driver'

const driver = neo4j.driver(
  'bolt://localhost:7687',
  neo4j.auth.basic('neo4j', 'password')
)

const session = driver.session()
const result = await session.run('MATCH (p:Person) RETURN p.name AS name')
await session.close()
await driver.close()
```

The app connects over Bolt, authenticates, runs a Cypher query, and closes both session and driver. Avoid hard-coded credentials outside demos.

## Review checklist

- What problems are graphs especially good at?
- How can graph traversal create privacy risks?
- What must be closed after Neo4j queries?


---

# DBSEC 11 — Advanced Topics: Encryption, Caching, Legacy Data, Audit Versions

## Repository category

- `11-advanced/*.js`

## Learning goals

- Understand encryption-at-rest examples.
- Use Redis query caching with Mongoose/Sequelize.
- Represent legacy data and version/audit history.

## Detailed concept explanation

### Encryption at rest

Encryption at rest protects stored data if the database files or backups are exposed. Application-level encryption encrypts selected fields before they
reach the database. Its security depends heavily on key management, IV/nonce use, authentication, and rotation.

### Query caching

Caching saves repeated query results in Redis to reduce database load. The security risk is stale data: permission changes, deleted records, or updated
sensitive fields may remain in cache unless invalidated.

### Versioning and auditability

Legacy-data and versioning examples show how systems can preserve historical resource states and track who performed changes. This supports forensic
analysis, accountability, and rollback, but audit logs themselves become sensitive data.

## Code snippets and explanations

### AES encryption helper shape

**Source:** `11-advanced/enc-at-rest.js`

```js
import crypto from 'crypto'

const algorithm = 'aes-256-ctr'
const secretKey = 'mysecretkey'

function encrypt(text) {
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv)
  return Buffer.concat([cipher.update(text), cipher.final()])
}
```

The example demonstrates field encryption. For production, do not hard-code keys; use a random IV/nonce per encryption and prefer authenticated
encryption modes or combine encryption with integrity protection.

### Mongoose query cache idea

**Source:** `11-advanced/mongoose-query-cache.js`

```js
let results = await User.find({ name: 'Jim' }).cache()
results = await User.find({ name: 'Jim' }).cache()
```

The first query can populate Redis; the second can reuse cached data. The application must decide when to invalidate cache entries.

### Sequelize cache idea

**Source:** `11-advanced/sequelize-query-cache-v2.js`

```js
let user = await User.findAll({
  where: { username: 'someuser' },
  cache: true
})
```

The ORM query is marked cacheable. Be careful caching user-specific or permission-dependent results; the cache key must include the security context.

### Versioned resource pattern

**Source:** `11-advanced/data-legacy.js`

```js
// Find all versions of a resource
// const versions = await ResourceVersions
//   .find({ resourceId: resource._id })
//   .populate('performedBy')
```

A separate versions collection can track historical states and who changed them. This improves auditability but requires access controls around history.

## Review checklist

- What does encryption at rest protect against?
- Why can caching become an authorization problem?
- What information should an audit/version record contain?


---

# DBSEC 12 — AI-Assisted Database Anomaly Detection

## Repository category

- `12-ai/mongo/*`
- `12-ai/mysql/*`

## Learning goals

- Generate normal and anomalous database activity.
- Train/load a TensorFlow.js autoencoder model.
- Monitor MongoDB and MySQL events for anomalies.

## Detailed concept explanation

### Anomaly detection for database security

Anomaly detection learns patterns of normal behavior and flags unusual events. In database security, this can mean unusual operations, rare table
access, unexpected deletes, abnormal write volume, or suspicious access timing. It is a detection control, not a replacement for access control.

### Autoencoder idea

An autoencoder compresses input features into a smaller representation and reconstructs them. If reconstruction error is high, the event may differ from
training data. The repository uses TensorFlow.js models for demonstration.

### Event sources

The MongoDB section uses generated data/anomalies and a saved model. The MySQL section uses binlog events through ZongJi, which can observe inserts,
updates, and deletes. Event monitoring must be secured because logs may reveal sensitive data.

## Code snippets and explanations

### Mongo anomaly generator

**Source:** `12-ai/mongo/generate-anomalies.js`

```js
import { MongoClient, ObjectId } from 'mongodb'

const uri = 'mongodb://127.0.0.1:27017/?replicaSet=rs0'
const client = new MongoClient(uri)

await client.connect()
// generate anomalous operations...
await client.close()
```

The script connects to a replica-set MongoDB instance and creates unusual operations for testing detection. Replica set setup is often required for
change-stream style monitoring.

### Train TensorFlow.js model

**Source:** `12-ai/mongo/update-model.js`

```js
import * as tf from '@tensorflow/tfjs-node'

const data = await getTrainingData()
await trainAutoencoder(data)
```

Training data is converted to features, then used to train an autoencoder. The quality of detection depends on representative normal data.

### MySQL binlog monitoring

**Source:** `12-ai/mysql/zong.js`

```js
const zongji = new ZongJi({
  host: '127.0.0.1',
  user: 'replica_user',
  password: 'replica_pass'
})

zongji.start({
  startAtEnd: true,
  includeEvents: ['tablemap', 'writerows', 'updaterows', 'deleterows'],
  includeSchema: { testdb: true }
})
```

ZongJi listens to MySQL binary log events. This can power monitoring and anomaly detection, but the replication user should have only the privileges
required to read events.

### Anomaly decision threshold

**Source:** `12-ai/mysql/detect-anomalies.js`

```js
const model = await tf.loadLayersModel('file://./model/model.json')
const THRESHOLD = 0.1
```

The model scores events and compares reconstruction error against a threshold. Low thresholds produce more alerts; high thresholds may miss attacks.

## Review checklist

- Why is anomaly detection not enough by itself?
- What features would you extract from database activity?
- How do false positives and false negatives affect security operations?


---

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


---

