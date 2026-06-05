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
