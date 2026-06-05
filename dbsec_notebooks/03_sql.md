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
