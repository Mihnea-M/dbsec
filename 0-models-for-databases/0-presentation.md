# DBSEC - Section 01: Introduction to Databases

## Models, Evolution, Trade-Offs, and Security Concerns

**Duration:** 40 minutes
**Position in course:** Introductory section
**Deliverables:** None
**Purpose:** Build a shared vocabulary for discussing database systems, database security, and database architecture throughout the course.

---

## 1. Course Context

This course studies databases from a security-focused perspective.

We will not only ask:

```text
How do we store and query data?
```

We will also ask:

```text
How do we protect data?
How do we control access?
How do we prevent unsafe states?
How do we detect abuse?
How do we recover after failure?
How do we design systems that remain understandable and maintainable?
```

The course will move through several database families and application patterns:

* database principles
* database design
* SQL and MySQL
* MySQL access from Node.js
* ORMs
* LDAP and identity management
* MySQL security
* MongoDB
* MongoDB access from Node.js
* ODMs
* MongoDB security
* distributed MongoDB architectures
* Redis
* Neo4j
* advanced application architectures

---

## 2. Why Databases Matter

Most applications are built around data.

A database is not just a place where data is stored. It is a system that helps an application answer questions such as:

* What data do we have?
* How is the data structured?
* Who is allowed to access it?
* How do we keep it correct?
* How do we recover it after failure?
* How do we scale it when more users arrive?
* How do we prove what happened to it?

Examples:

* A banking system stores accounts, balances, transactions, users, permissions, and audit logs.
* A hospital system stores patients, doctors, appointments, prescriptions, and medical history.
* A social network stores users, posts, comments, likes, messages, relationships, and recommendations.
* An e-commerce platform stores products, customers, carts, payments, orders, stock, invoices, and delivery events.

In database security, the database is often the most valuable target because it stores the state that the rest of the system depends on.

---

## 3. Data, Information, and State

Before discussing databases, we should distinguish between three related ideas.

### Data

Raw facts represented in a system.

Example:

```text
42
"Alice"
"2025-04-15"
"paid"
```

### Information

Data interpreted in context.

Example:

```text
Order #42 was paid by Alice on 2025-04-15.
```

### State

The current condition of a system, represented through data.

Example:

```text
The order is currently paid, but not yet shipped.
```

A database is often the main keeper of application state. This makes it one of the most sensitive components in an application.

---

## 4. What Is a Database?

A database is an organized collection of data.

A database management system, or DBMS, is the software that allows applications and users to create, read, update, delete, organize, secure, and recover that data.

Examples of DBMSs:

* MySQL
* PostgreSQL
* SQLite
* MongoDB
* Redis
* Neo4j
* Cassandra
* Elasticsearch / OpenSearch

A database system usually provides:

* a data model
* a query language or API
* storage management
* indexes
* transactions or operation guarantees
* concurrency control
* access control
* backup and recovery tools
* replication or clustering features
* monitoring and audit capabilities

---

## 5. Database Evolution

Database systems evolved together with application needs.

### File-Based Storage

Early systems often stored data directly in files.

Example:

```text
users.csv
orders.csv
payments.txt
```

This can work for small systems, but problems appear quickly:

* weak structure
* duplicated logic
* difficult concurrency
* difficult access control
* difficult recovery
* no standard query language

### Relational Databases

Relational databases introduced a strong model based on relations, constraints, and declarative queries.

They became dominant because they support:

* structured data
* consistency
* transactions
* powerful queries
* shared access
* mature tooling

### NoSQL and Specialized Databases

As web-scale and distributed applications grew, many systems needed different trade-offs.

This led to wider use of:

* document databases
* key-value stores
* column-family stores
* graph databases
* time-series databases
* search engines

### Cloud, Distributed, and AI-Oriented Databases

Modern applications increasingly use:

* managed cloud databases
* globally distributed databases
* serverless databases
* streaming/event systems
* vector databases
* AI retrieval systems

The future of databases is not one single model. It is a combination of models, each chosen for a specific workload.

---

## 6. The Central Question: What Shape Does the Data Have?

Different databases organize data differently.

The most important early design question is:

> What shape does the data naturally have?

Some data looks like tables.
Some data looks like documents.
Some data looks like a graph.
Some data looks like events.
Some data looks like key-value pairs.
Some data looks like high-dimensional vectors.

The data model influences:

* how we represent entities
* how we express relationships
* how we query the database
* how we enforce correctness
* how we secure access
* how we scale the system

---

## 7. Entity-Value Models

An entity-value model represents data as entities, attributes, and values.

Example:

```text
Entity: User 17
Attribute: name
Value: Alice

Entity: User 17
Attribute: email
Value: alice@example.com

Entity: User 17
Attribute: role
Value: admin
```

This approach is flexible because new attributes can be added without changing a fixed table structure.

A common form is the Entity-Attribute-Value pattern:

| entity_id | attribute  | value                                         |
| --------- | ---------- | --------------------------------------------- |
| 17        | name       | Alice                                         |
| 17        | email      | [alice@example.com](mailto:alice@example.com) |
| 17        | role       | admin                                         |
| 18        | name       | Bob                                           |
| 18        | department | Sales                                         |

### Strengths

* Very flexible schema
* Useful when attributes vary greatly between entities
* Can support metadata-driven systems
* Useful in some configuration, medical, or catalog systems

### Weaknesses

* Harder to query correctly
* Harder to validate
* Harder to enforce constraints
* Can become inefficient
* Can hide structure that should be explicit

### Security Concern

Flexible models can make validation and authorization more difficult.

If permissions depend on fields, but fields are dynamic, then access control must understand not only the entity but also the meaning of each attribute.

Example risk:

```text
A user is allowed to update profile fields.
The system stores fields dynamically.
The user adds or modifies an attribute called role = admin.
```

---

## 8. Relational Models

The relational model organizes data into relations, usually implemented as tables.

A table contains rows and columns.

Example:

### Users

| id | name  | email                                         |
| -- | ----- | --------------------------------------------- |
| 1  | Alice | [alice@example.com](mailto:alice@example.com) |
| 2  | Bob   | [bob@example.com](mailto:bob@example.com)     |

### Orders

| id  | user_id |  total | status  |
| --- | ------- | -----: | ------- |
| 101 | 1       | 120.00 | paid    |
| 102 | 1       |  80.00 | pending |
| 103 | 2       |  50.00 | shipped |

The relationship is represented by `Orders.user_id`, which refers to `Users.id`.

Relational databases are usually queried with SQL.

```sql
SELECT users.name, orders.total, orders.status
FROM users
JOIN orders ON orders.user_id = users.id
WHERE users.id = 1;
```

### Strengths

* Clear structure
* Strong constraints
* Mature transaction support
* Powerful query language
* Good for complex relationships and reporting
* Good for financial, administrative, and operational data

### Weaknesses

* Schema changes can require migrations
* Object-to-table mapping can be awkward in applications
* Horizontal scaling can be complex
* Not always ideal for deeply nested or highly variable data

### Security Concern

Relational databases often contain critical business data and support fine-grained access control, but they are also frequent targets for SQL injection, privilege escalation, and data exfiltration.

Common security topics:

* user and role management
* least privilege
* prepared statements
* views and stored procedures
* row-level security
* encryption at rest
* encrypted transport
* audit logs

---

## 9. Document Models

The document model stores data as structured documents, usually JSON-like objects.

Example document:

```json
{
  "_id": "u1",
  "name": "Alice",
  "email": "alice@example.com",
  "orders": [
    {
      "id": "o101",
      "total": 120,
      "status": "paid"
    },
    {
      "id": "o102",
      "total": 80,
      "status": "pending"
    }
  ]
}
```

Document databases are useful when data is naturally hierarchical or when application objects map cleanly to documents.

Example systems:

* MongoDB
* CouchDB
* Firestore

### Strengths

* Natural fit for JSON-based applications
* Flexible schema
* Good for nested data
* Easy to evolve during early development
* Often convenient for APIs and web applications

### Weaknesses

* Data duplication is common
* Complex cross-document joins are less natural
* Consistency across duplicated data must be managed carefully
* Schema flexibility can become schema confusion

### Security Concern

Document databases are vulnerable to their own forms of injection and insecure query construction.

Example NoSQL injection idea:

```json
{
  "username": "alice",
  "password": { "$ne": null }
}
```

If the application accepts objects where it expected strings, an attacker may change the meaning of a query.

Important controls:

* strict input validation
* schema validation
* query sanitization
* least-privilege database users
* avoiding direct use of untrusted objects in queries

---

## 10. Graph Models

The graph model represents data as nodes and relationships.

Example:

```text
(Alice)-[:FRIEND_OF]->(Bob)
(Alice)-[:WORKS_FOR]->(CompanyX)
(Bob)-[:PURCHASED]->(ProductY)
(ProductY)-[:BELONGS_TO]->(CategoryZ)
```

Graph databases are useful when relationships are as important as entities.

Example systems:

* Neo4j
* Amazon Neptune
* JanusGraph

Example query idea:

```cypher
MATCH (a:Person {name: 'Alice'})-[:FRIEND_OF]->(friend)-[:PURCHASED]->(product)
RETURN friend.name, product.name;
```

### Strengths

* Excellent for relationship-heavy data
* Natural for paths, networks, dependencies, and recommendations
* Useful for fraud detection and access-control analysis
* Can express complex traversals clearly

### Weaknesses

* Not always ideal for large aggregate reporting
* Requires a different way of thinking
* Scaling graph traversals can be challenging
* Security models can become complex when relationships imply permissions

### Security Concern

Graph databases can reveal sensitive relationships, even when individual nodes look harmless.

Example:

* A user profile may not be sensitive by itself.
* A relationship showing that the user visited a clinic may be sensitive.
* A path showing that two accounts share devices, addresses, and payment methods may reveal fraud or private behavior.

In graph systems, protecting relationships is as important as protecting entities.

---

## 11. Key-Value and Shared Data Stores

A key-value store maps keys to values.

Example:

```text
session:abc123 -> { "userId": 17, "expires": "2025-04-15T12:00:00Z" }
cart:user:17 -> [ "p1", "p2", "p3" ]
rate-limit:ip:192.0.2.10 -> 42
```

Example systems:

* Redis
* Memcached
* DynamoDB, when used in a key-value style

### Strengths

* Very fast
* Simple access pattern
* Good for caching, queues, sessions, rate limits, temporary data
* Often used as infrastructure around another primary database

### Weaknesses

* Limited query flexibility
* Data modeling is application-driven
* Persistence guarantees vary by system and configuration
* Easy to misuse as a primary database without enough structure

### Security Concern

Shared stores often contain sensitive temporary data:

* sessions
* tokens
* password reset codes
* cached user profiles
* queue messages
* internal job payloads

A poorly secured Redis instance can expose the entire application, even if the main database is protected.

---

## 12. Time-Series, Event, and Log-Oriented Data

Some data is best understood as a sequence of events over time.

Examples:

```text
2025-04-15T10:00:00Z user.login user=17 ip=203.0.113.5
2025-04-15T10:01:10Z order.created order=101 user=17
2025-04-15T10:02:45Z payment.accepted order=101 amount=120
2025-04-15T10:10:00Z user.logout user=17
```

Time-series and log-oriented systems are used for:

* metrics
* monitoring
* audit logging
* sensor data
* financial ticks
* application events
* security events

Example systems:

* InfluxDB
* TimescaleDB
* Prometheus
* Elasticsearch / OpenSearch
* Kafka, when used as an event log

### Strengths

* Excellent for temporal analysis
* Good for monitoring and anomaly detection
* Useful for incident response
* Supports append-only designs

### Weaknesses

* Updating historical data may be unnatural
* Query patterns are often specialized
* Storage volume can grow very quickly
* Retention policies must be planned carefully

### Security Concern

Logs can protect a system, but they can also leak sensitive data.

Bad log example:

```text
Failed login for alice@example.com with password MySecretPassword123
```

Good log example:

```text
Failed login for user_id=17 from ip=203.0.113.5
```

Audit logs should be useful, tamper-resistant, and privacy-aware.

---

## 13. Vector Databases and AI-Oriented Data

Modern AI systems often represent text, images, audio, or behavior as vectors: lists of numbers that encode meaning or similarity.

Example:

```text
"database security" -> [0.12, -0.44, 0.91, ...]
"SQL injection"     -> [0.14, -0.40, 0.88, ...]
"banana bread"      -> [-0.75, 0.21, 0.05, ...]
```

A vector database can search for items that are similar, not just exactly equal.

Example use cases:

* semantic search
* recommendation systems
* retrieval-augmented generation
* duplicate detection
* image similarity
* anomaly detection

Example systems or systems with vector support:

* Pinecone
* Weaviate
* Milvus
* Qdrant
* PostgreSQL with pgvector
* Elasticsearch / OpenSearch vector search
* MongoDB vector search

### Strengths

* Enables similarity-based search
* Useful for AI applications
* Supports natural-language retrieval
* Can complement traditional structured databases

### Weaknesses

* Results are approximate or similarity-based
* Access control is harder when chunks come from many documents
* Embeddings can leak semantic information
* Evaluation is more difficult than exact queries

### Security Concern

Vector search introduces new questions:

* Can users retrieve information they should not see?
* Were embeddings generated from sensitive data?
* Can deleted data still be inferred from embeddings?
* Can prompt injection affect retrieval pipelines?
* Can poisoned documents manipulate search results?

Future database security will increasingly include AI data pipelines, embeddings, and retrieval systems.

---

## 14. Core Database Concerns

When choosing or designing a database system, we usually care about several recurring concerns.

### Structure

How is data organized?

* tables
* documents
* graphs
* key-value pairs
* events
* vectors

### Correctness

How do we prevent invalid states?

Examples:

* an order must belong to a valid user
* a bank balance must not change without a transaction record
* an email must be unique
* a deleted user should not still own active resources

### Consistency

Do all users and services see the same data at the same time?

Example:

```text
Alice transfers 100 EUR to Bob.
Alice's balance decreases.
Bob's balance increases.
The system must not show only half of the transfer as completed.
```

### Availability

Can the system respond when users need it?

Example:

```text
An online store should continue accepting orders during high traffic.
```

### Performance

How quickly can the system answer queries or process writes?

Performance depends on:

* indexes
* query design
* data model
* hardware
* caching
* replication
* partitioning
* workload type

### Scalability

Can the system handle growth?

Growth can mean:

* more users
* more data
* more writes
* more reads
* more geographic regions
* more services

### Durability

Once data is committed, will it survive crashes?

Example:

```text
A payment marked as completed must not disappear after a server restart.
```

### Security

Who can access the data, and what can they do with it?

Security includes:

* authentication
* authorization
* encryption in transit
* encryption at rest
* secret management
* audit logging
* backup protection
* injection prevention
* data minimization
* secure deletion

### Operability

Can we run the system safely in production?

This includes:

* monitoring
* backups
* recovery procedures
* migrations
* upgrades
* incident response
* capacity planning

---

## 15. Consistency in Two Different Meanings

The word consistency appears in multiple database contexts.

### Consistency in ACID

In ACID transactions, consistency means that a transaction moves the database from one valid state to another valid state.

Example:

```text
Before transaction:
Alice has 500 EUR.
Bob has 100 EUR.

Transaction:
Alice sends 50 EUR to Bob.

After transaction:
Alice has 450 EUR.
Bob has 150 EUR.
```

The database should not end in an invalid state such as:

```text
Alice has 450 EUR.
Bob still has 100 EUR.
The missing 50 EUR disappeared.
```

### Consistency in Distributed Systems

In distributed systems, consistency often means that different nodes or users see the same data.

Example:

```text
Node A says the order is paid.
Node B says the order is pending.
```

This is a different concern from ACID consistency, even though the same word is used.

---

## 16. ACID Transactions

Many relational databases emphasize ACID transactions.

ACID means:

### Atomicity

A transaction happens completely or not at all.

Example:

```text
Transfer money from Alice to Bob.
Debit Alice and credit Bob must succeed together.
```

### Consistency

A transaction preserves database rules.

Example:

```text
A foreign key must still point to an existing record.
```

### Isolation

Concurrent transactions should not interfere in unsafe ways.

Example:

```text
Two withdrawals should not both assume the same original balance.
```

### Durability

Once committed, data survives failure.

Example:

```text
A completed payment should remain completed after a crash.
```

ACID is especially important in systems where correctness is more important than raw flexibility.

Examples:

* payments
* inventory
* accounting
* identity and access control
* legal records

---

## 17. CAP Theorem

The CAP theorem describes a fundamental trade-off in distributed data systems.

CAP stands for:

* Consistency
* Availability
* Partition tolerance

### Consistency

Every read receives the most recent write, or an error.

Simplified example:

```text
If Alice updates her password, every database node should immediately know the new password.
```

### Availability

Every request to a working node receives a response.

Simplified example:

```text
If a user asks for their profile, the system responds instead of refusing the request.
```

### Partition Tolerance

The system continues operating even if network communication between nodes is delayed or broken.

Simplified example:

```text
The database has nodes in Bucharest and Frankfurt.
The network connection between them fails.
The system must decide how to behave.
```

### The Core Idea

In the presence of a network partition, a distributed database cannot fully guarantee both consistency and availability.

It must choose what to prioritize:

* refuse or delay some requests to preserve consistency
* answer requests using possibly stale data to preserve availability

---

## 18. CAP Example: Online Store Stock

Imagine an online store with two database replicas:

```text
Replica A: Europe
Replica B: North America
```

A product has one item left in stock.

```text
Product: Laptop
Stock: 1
```

A network partition occurs. Replica A and Replica B cannot communicate.

At the same time:

```text
Customer 1 buys the laptop through Replica A.
Customer 2 buys the laptop through Replica B.
```

The system has two possible priorities.

### Prioritize Consistency

One replica refuses or delays the purchase until it can confirm the latest stock.

Result:

```text
The store avoids selling the same item twice.
Some users may receive an error or timeout.
```

### Prioritize Availability

Both replicas accept purchases independently.

Result:

```text
The store remains responsive.
The same item may be sold twice.
The conflict must be repaired later.
```

There is no universally correct choice. The right choice depends on the application.

---

## 19. CAP Is Not a Simple Database Label

It is common to hear that a database is "CP" or "AP".

This can be useful as a simplification, but it is incomplete.

Important points:

* CAP matters specifically when there is a network partition.
* Many systems can provide both consistency and availability during normal operation.
* Modern databases often allow configuration choices.
* Different operations in the same system may have different guarantees.
* Real systems also care about latency, durability, cost, and operational complexity.

A better question is not:

```text
Is this database CP or AP?
```

A better question is:

```text
What happens when part of the system cannot communicate with another part?
```

---

## 20. CAP and Security

CAP is not only a performance or architecture topic. It can also affect security.

Example: access revocation.

```text
An administrator removes Bob's access to a sensitive system.
```

If the system prioritizes availability during a partition, one replica may continue accepting Bob's requests until it receives the revocation update.

Security question:

```text
Is stale authorization acceptable?
```

For some systems, the answer is no.

Examples where consistency may matter more:

* access revocation
* account lockout
* payment authorization
* medical record permissions
* legal hold status

Examples where availability may matter more:

* public content delivery
* product catalog browsing
* non-critical analytics
* social feed display
* telemetry ingestion

---

## 21. Consistency, Availability, and Performance

Database design often involves trade-offs among:

```text
Correctness
Availability
Performance
Cost
Complexity
Security
```

A system that is very strict may be safer but slower or less available.

A system that is very available may accept temporary inconsistency.

A system that is very fast may use caches that become stale.

A system that is very flexible may be harder to validate and secure.

Design means choosing acceptable trade-offs for a specific application.

---

## 22. Choosing a Database Model

There is no best database for all situations.

Use the problem to guide the model.

### Relational

Good fit when:

* data has clear structure
* relationships are important
* constraints matter
* transactions matter
* reporting matters

Example:

```text
Banking, orders, accounting, ERP, identity management
```

### Document

Good fit when:

* data is hierarchical
* objects vary by type
* JSON is the natural application format
* development needs schema flexibility

Example:

```text
Product catalogs, content management, user profiles, event payloads
```

### Graph

Good fit when:

* relationships are central
* paths matter
* recommendations or dependency analysis are needed

Example:

```text
Fraud detection, social networks, access graphs, network topology
```

### Key-Value

Good fit when:

* access is mostly by key
* speed matters
* values are temporary or simple

Example:

```text
Sessions, caches, queues, counters, rate limits
```

### Time-Series / Logs

Good fit when:

* data is append-heavy
* time is central
* monitoring or auditing is needed

Example:

```text
Metrics, audit logs, security events, IoT sensor readings
```

### Vector

Good fit when:

* similarity search matters
* data is semantic, unstructured, or AI-generated
* exact matching is not enough

Example:

```text
Semantic search, RAG, recommendations, image search
```

---

## 23. Polyglot Persistence

Modern systems often use more than one database model.

Example architecture:

```text
PostgreSQL / MySQL: users, orders, payments
MongoDB: flexible product metadata
Redis: sessions, queues, rate limits
Elasticsearch: search and logs
Neo4j: fraud relationships
Vector store: semantic search over documents
```

This is called polyglot persistence.

### Benefits

* Each workload uses a suitable tool
* Better performance for specialized tasks
* More flexible architecture

### Risks

* More operational complexity
* More security configuration
* More places to leak data
* Harder consistency management
* Harder backups and recovery
* Harder auditing

Security becomes more difficult as the number of data stores increases.

---

## 24. The Future of Databases

Database systems are evolving because applications are evolving.

Important directions include:

### Cloud-Native and Serverless Databases

Teams increasingly want databases that scale automatically and reduce operational burden.

Questions:

* Who controls backups?
* Who controls encryption keys?
* How is access audited?
* What happens during provider outage?

### Distributed SQL

Some systems try to combine relational structure and SQL with distributed scalability.

Questions:

* What consistency guarantees are provided?
* What is the latency cost?
* How are regions and replicas managed?

### AI-Native and Vector-Enabled Databases

Databases increasingly support embeddings, similarity search, and AI retrieval.

Questions:

* Can access control be preserved during retrieval?
* Can embeddings leak sensitive meaning?
* Can poisoned data affect model outputs?

### Real-Time and Streaming Data

More systems process events continuously instead of only querying stored state.

Questions:

* How do we audit streams?
* How do we recover from bad events?
* How do we enforce permissions over event flows?

### Privacy-Preserving Data Systems

Techniques such as encryption, confidential computing, differential privacy, searchable encryption, and homomorphic encryption attempt to reduce exposure of raw data.

Questions:

* What queries remain possible?
* What is the performance cost?
* What metadata still leaks?

### Edge and Offline-First Databases

Applications increasingly run across phones, browsers, edge devices, and intermittent networks.

Questions:

* How are conflicts resolved?
* What happens to access control while offline?
* How is local data protected?

---

## 25. Database Security Starts with the Model

Many database security problems are caused by modeling decisions made early.

Examples:

* storing passwords instead of password hashes
* giving the application admin-level database access
* failing to model ownership
* mixing public and private data without access rules
* storing secrets in source code
* logging sensitive values
* duplicating data without knowing how to update or delete all copies
* relying only on application checks while the database accepts unsafe direct access

Good database security requires:

* good modeling
* good access control
* good query construction
* good operational practices
* good monitoring
* good recovery planning

---

## 26. Running Example for the Course

Throughout the course, we can return to a simple application domain.

Example: a project management system.

Entities:

```text
Users
Organizations
Projects
Tasks
Comments
Files
Roles
Permissions
Audit events
```

Possible database models:

### Relational

```text
Users, Projects, Tasks, Roles, Permissions
```

Good for structured data and access-control rules.

### Document

```text
Flexible project settings, task metadata, imported forms
```

Good for variable structures.

### Graph

```text
User relationships, organization membership, permission inheritance
```

Good for analyzing who can reach what.

### Redis

```text
Sessions, queues, rate limits, cached project summaries
```

Good for temporary high-speed data.

### Logs

```text
Audit events, login attempts, permission changes
```

Good for monitoring and incident response.

### Vector Search

```text
Semantic search over project documents and comments
```

Good for AI-assisted retrieval.

This example helps show why modern applications often combine several database models.

---

## 27. Summary

A database is not just storage. It is a system for managing application state.

The main database models include:

* entity-value
* relational
* document
* graph
* key-value
* time-series / log-oriented
* vector / AI-oriented

Each model makes some operations easier and others harder.

The main concerns when discussing databases are:

* structure
* correctness
* consistency
* availability
* performance
* scalability
* durability
* security
* operability

The CAP theorem teaches that distributed systems must make trade-offs during network partitions.

Security is connected to all of these choices. A database design affects not only performance and developer experience, but also access control, privacy, auditing, recovery, and resilience.

---

## 28. Discussion Questions

1. Why might a relational database be safer than a document database for financial transactions?
2. Why might a document database be more convenient for a product catalog?
3. What security risks appear when using Redis for sessions?
4. What information can a graph relationship reveal that a node alone does not?
5. In the CAP stock example, would you prioritize consistency or availability? Why?
6. Is stale authorization ever acceptable?
7. What new security problems appear when adding vector search to an application?
8. Why does using multiple databases increase operational and security complexity?


