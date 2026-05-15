# DBSEC - Section 01: Introduction to Databases

# Introduction to Databases

## Models, Evolution, Trade-Offs, and Security Concerns

* Duration: 40 minutes
* Goal: Build shared vocabulary
* Focus: Security and architecture

---

# Course Context

## What This Course Studies

This course studies databases from a security-focused perspective.

---

## Main Questions

```text
How do we store and query data?
```

---

## Main Questions (continued)

```text
How do we protect data?
How do we control access?
```

---

## Main Questions (continued)

```text
How do we detect abuse?
How do we recover after failure?
```

---

## Main Questions (continued)

```text
How do we keep systems understandable?
How do we keep systems maintainable?
```

---

## Course Topics

* database principles
* database design
* SQL and MySQL
* Node.js database access

---

## Course Topics (continued)

* ORMs and ODMs
* LDAP and identity management
* MySQL security
* MongoDB

---

## Course Topics (continued)

* MongoDB security
* distributed architectures
* Redis
* Neo4j

---

# Why Databases Matter

## Applications Depend on Data

Examples:

* users
* permissions
* orders
* payments

---

## Applications Depend on Data (continued)

Examples:

* messages
* files
* logs
* analytics

---

## A Database Helps Answer

* What data exists?
* How is data structured?
* Who can access it?

---

## A Database Helps Answer (continued)

* How do we keep data correct?
* How do we recover after failure?
* How do we scale?

---

## Banking Example

A banking system stores:

* accounts
* balances
* transactions

---

## Banking Example (continued)

A banking system also stores:

* users
* permissions
* audit logs

---

## Hospital Example

A hospital system stores:

* patients
* doctors
* appointments

---

## Hospital Example (continued)

A hospital system also stores:

* prescriptions
* medical history

---

## Social Network Example

A social network stores:

* users
* posts
* comments

---

## Social Network Example (continued)

A social network also stores:

* likes
* messages
* relationships

---

## E-Commerce Example

An e-commerce system stores:

* products
* customers
* carts

---

## E-Commerce Example (continued)

An e-commerce system also stores:

* payments
* orders
* invoices

---

## Why Databases Become Targets

```text
The database stores the application state.
```

This makes it a valuable target.

---

# Data, Information, and State

## Three Related Concepts

* data
* information
* state

---

## Data

Raw facts.

Examples:

```text
42
"Alice"
"paid"
```

---

## Information

Data interpreted in context.

Example:

```text
Order #42 was paid by Alice.
```

---

## State

The current condition of a system.

Example:

```text
The order is paid,
but not yet shipped.
```

---

# What Is a Database?

## Database

```text
An organized collection of data.
```

---

## DBMS

A DBMS supports:

* create
* read
* update
* delete

---

## DBMS (continued)

A DBMS also supports:

* organization
* security
* recovery

---

## Example DBMSs

* MySQL
* PostgreSQL
* SQLite
* MongoDB

---

## Example DBMSs (continued)

* Redis
* Neo4j
* Cassandra
* OpenSearch

---

## Database Features

A database system may provide:

* query language
* indexes
* transactions

---

## Database Features (continued)

A database system may also provide:

* access control
* replication
* monitoring

---

# Database Evolution

## Main Evolution Stages

* file-based storage
* relational databases
* NoSQL systems
* distributed and AI-oriented systems

---

## File-Based Storage

Examples:

```text
users.csv
orders.csv
payments.txt
```

---

## File-Based Problems

* duplicated logic
* weak structure
* difficult concurrency

---

## File-Based Problems (continued)

* difficult recovery
* weak access control
* no standard query language

---

## Relational Databases

Relational systems introduced:

* relations
* constraints
* declarative queries

---

## Relational Databases (continued)

Relational systems also introduced:

* transactions
* shared access
* mature tooling

---

## NoSQL Systems

NoSQL systems include:

* document databases
* key-value stores
* graph databases

---

## NoSQL Systems (continued)

NoSQL systems also include:

* time-series databases
* search engines
* column-family stores

---

## Modern Database Systems

Modern systems increasingly use:

* cloud databases
* distributed databases
* vector databases

---

# The Shape of Data

## Central Question

```text
What shape does the data naturally have?
```

---

## Common Data Shapes

* tables
* documents
* graphs

---

## Common Data Shapes (continued)

* events
* key-value pairs
* vectors

---

## Why Shape Matters

The data model affects:

* representation
* relationships
* queries

---

## Why Shape Matters (continued)

The data model also affects:

* validation
* security
* scalability

---

# Relational Models

## Relational Model

Data is organized into:

* tables
* rows
* columns

---

## Users Table

| id | name  |
| -- | ----- |
| 1  | Alice |
| 2  | Bob   |

---

## Orders Table

| id  | user_id | total |
| --- | ------- | ----: |
| 101 | 1       |   120 |
| 102 | 1       |    80 |

---

## Relationship Example

```text
Orders.user_id -> Users.id
```

---

## Relational Strengths

* clear structure
* strong constraints
* mature transactions

---

## Relational Strengths (continued)

* powerful queries
* reporting support
* mature tooling

---

## Relational Weaknesses

* migrations may be required
* scaling can be complex
* variable data can be awkward

---

## Relational Security Topics

* SQL injection
* least privilege
* prepared statements
* audit logs

---

# Document Models

## Document Model

Documents are usually:

```text
JSON-like objects
```

---

## Document Example

```json
{
  "name": "Alice",
  "orders": []
}
```

---

## Document Strengths

* flexible schema
* nested structures
* natural for APIs

---

## Document Weaknesses

* duplication is common
* joins are less natural
* schema confusion may appear

---

## NoSQL Injection Risk

```json
{
  "password": { "$ne": null }
}
```

---

# Graph Models

## Graph Model

Data is represented as:

* nodes
* relationships

---

## Graph Example

```text
(Alice)-[:FRIEND_OF]->(Bob)
```

---

## Graph Strengths

* excellent for relationships
* useful for recommendations
* useful for fraud detection

---

## Graph Weaknesses

* harder traversals at scale
* complex security models

---

# Key-Value Stores

## Key-Value Model

```text
key -> value
```

---

## Example

```text
session:abc123 -> { userId: 17 }
```

---

## Key-Value Strengths

* very fast
* simple access
* useful for caching

---

## Key-Value Risks

* limited queries
* easy misuse
* sensitive temporary data

---

# Time-Series and Logs

## Time-Oriented Data

Examples:

* metrics
* audit logs
* security events

---

## Log Example

```text
2025-04-15 user.login user=17
```

---

## Logging Risk

Bad logs may leak secrets.

---

## Bad Log Example

```text
Failed login with password MySecretPassword123
```

---

## Better Log Example

```text
Failed login for user_id=17
```

---

# Vector Databases

## Vector Databases

Vectors encode:

* similarity
* semantic meaning

---

## Vector Use Cases

* semantic search
* recommendations
* AI retrieval

---

## Vector Risks

* sensitive embeddings
* retrieval leaks
* poisoned documents

---

# Core Concerns

## Main Database Concerns

* correctness
* consistency
* availability

---

## Main Database Concerns (continued)

* performance
* scalability
* durability

---

## Main Database Concerns (continued)

* security
* operability

---

# ACID

## ACID

* Atomicity
* Consistency
* Isolation
* Durability

---

## Atomicity

```text
All or nothing.
```

---

## Consistency

```text
Transactions preserve rules.
```

---

## Isolation

```text
Concurrent transactions should not interfere unsafely.
```

---

## Durability

```text
Committed data survives crashes.
```

---

# CAP Theorem

## CAP

* Consistency
* Availability
* Partition tolerance

---

## CAP Core Idea

During a partition:

```text
A distributed system cannot fully guarantee both consistency and availability.
```

---

## CAP Example

Two replicas.

One item left in stock.

Network partition occurs.

---

## Prioritize Consistency

* avoid double sale
* may refuse requests

---

## Prioritize Availability

* continue responding
* may sell twice

---

## CAP Security Question

```text
Is stale authorization acceptable?
```

---

# Choosing a Database

## Choose Relational When

* structure matters
* constraints matter
* transactions matter

---

## Choose Document When

* JSON is natural
* flexibility matters
* nested data exists

---

## Choose Graph When

* relationships matter
* paths matter
* recommendations matter

---

## Choose Key-Value When

* access is by key
* speed matters
* data is temporary

---

## Choose Vector When

* similarity matters
* semantic search matters
* AI retrieval matters

---

# Polyglot Persistence

## Polyglot Persistence

Modern systems often use multiple databases.

---

## Example Architecture

```text
MySQL: users
MongoDB: metadata
Redis: sessions
Neo4j: relationships
```

---

## Polyglot Risks

* more complexity
* more security configuration
* more consistency problems

---

# Future Directions

## Important Directions

* cloud-native systems
* distributed SQL
* AI-native databases

---

## Important Directions (continued)

* streaming systems
* privacy-preserving systems
* edge databases

---

# Security Starts with the Model

## Early Modeling Decisions Matter

Examples:

* storing passwords incorrectly
* mixing public and private data
* weak ownership modeling

---

## Good Database Security Requires

* good modeling
* safe queries
* access control
* monitoring
* recovery planning

---

# Running Example

## Project Management System

Entities:

* users
* projects
* tasks
* roles

---

## Multiple Database Models

Possible technologies:

* MySQL
* MongoDB
* Redis
* Neo4j
* vector search

---

# Summary

## Main Idea

A database is not just storage.

It manages application state.

---

## Main Database Models

* relational
* document
* graph
* key-value
* vector

---

## Final Takeaway

Database choices affect:

* performance
* security
* recovery
* scalability
* auditing

---

# Discussion Questions

## Discussion Questions

1. Why might a relational database be safer for financial transactions?
2. Why might a document database be convenient for a product catalog?
3. What security risks appear when using Redis for sessions?
4. What can a graph relationship reveal that a node alone does not?

---

## More Discussion Questions

5. In the CAP stock example, would you prioritize consistency or availability?
6. Is stale authorization ever acceptable?
7. What new security problems appear with vector search?
8. Why does using multiple databases increase security complexity?
