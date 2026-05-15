# DBSEC - Section 02: Database Design

# Database Design

## Anomalies, Normalization, Denormalization, and Design Trade-Offs

* Duration: 60 minutes
* Goal: Understand normalization and anomalies
* Deliverable: Normalize a raw database design

---

# Why Database Design Matters

## Database Design Decides

* what entities exist
* how facts are stored
* which constraints exist

---

## Database Design Decides (continued)

* how relationships are represented
* which facts are duplicated
* which facts exist only once

---

## Data Outlives Applications

Applications change.

But data often survives:

* rewrites
* migrations
* integrations

---

## Data Outlives Applications (continued)

Data may survive:

* framework changes
* UI redesigns
* new services

Database structure matters long-term.

---

# Database Design and Integrity

## Application-Level Integrity

Example:

```text
The application checks whether an order belongs to an existing user.
```

---

## Risks of Application-Only Integrity

* validation may fail
* checks may be inconsistent
* scripts may bypass validation

---

## Database-Level Integrity

Example:

```text
A foreign key prevents an order from referencing a missing user.
```

---

## Advantages of Database Constraints

* centralized validation
* harder to bypass
* safer direct writes

---

## Database Constraints Help When

* developers forget validation
* multiple applications share the database
* migrations introduce bad data

---

## Database Constraints Help When (continued)

* scripts write directly
* attackers reach unexpected endpoints

---

# From Real Life to a Data Model

## Example Domain

University system.

Real-world facts:

```text
Students enroll in courses.
Professors teach courses.
Students receive grades.
```

---

## Possible Entities

```text
Students
Courses
Professors
Enrollments
Grades
```

---

## Possible Relationships

```text
A student enrolls in many courses.
A course contains many students.
```

---

## Possible Relationships (continued)

```text
A professor teaches many courses.
```

---

## Bad Models

Bad models:

* mix unrelated facts
* duplicate information
* create anomalies

---

## Good Models

Good models:

* separate concerns
* reduce duplication
* clarify relationships

---

# Basic Relational Terms

## Relation

Relation = table

Example:

```text
Students
```

---

## Attribute

Attribute = column

Examples:

```text
student_id
name
email
```

---

## Tuple

Tuple = row

Example:

```text
(1, "Alice", "alice@example.com")
```

---

## Domain

Domain = allowed values

Examples:

```text
grade must be between 1 and 10
email must follow email format
```

---

# Raw Table Example

## Initial Table

| student_id | student_name | course_code | grade |
| ---------- | ------------ | ----------- | ----: |
| 1          | Alice        | DBSEC       |     9 |
| 1          | Alice        | NET         |     8 |
| 2          | Bob          | DBSEC       |    10 |

---

## Facts Mixed Together

This table mixes:

* student facts
* course facts
* professor facts

---

## Facts Mixed Together (continued)

This table also mixes:

* enrollment facts
* grade facts

---

## Redundancy

Repeated facts:

```text
Alice appears multiple times.
DBSEC appears multiple times.
Ionescu appears multiple times.
```

---

## Risks of Redundancy

* inconsistent updates
* unclear source of truth
* larger storage

---

## Risks of Redundancy (continued)

* harder deletions
* harder access control
* harder auditing

---

# Data Anomalies

## Main Anomaly Types

* insert anomalies
* update anomalies
* delete anomalies

---

## Structural Problems

Anomalies are structural problems.

They appear because of:

```text
How the data is modeled.
```

---

# Insert Anomalies

## Insert Anomaly

Definition:

```text
A fact cannot be inserted independently.
```

---

## Insert Anomaly Example

We want:

```text
A new course: CRYPTO
```

---

## Insert Anomaly Example (continued)

But:

```text
No student is enrolled yet.
```

---

## Problem

```text
The course cannot exist independently.
```

---

# Update Anomalies

## Update Anomaly

Definition:

```text
Updating one fact requires changing many rows.
```

---

## Update Example

Professor email changes:

```text
ion@uni.example
->
ionescu@uni.example
```

---

## Contradictory Facts

If only some rows are updated:

```text
The database contains contradictory facts.
```

---

## Security Example

```text
A user's role is duplicated in multiple tables.
```

---

## Security Example (continued)

One row says:

```text
admin
```

Another says:

```text
user
```

---

## Security Risk

Possible result:

```text
Excessive permissions remain active.
```

---

# Delete Anomalies

## Delete Anomaly

Definition:

```text
Deleting one fact accidentally deletes another.
```

---

## Delete Example

Bob drops DBSEC.

---

## Delete Example (continued)

If Bob was the last student:

```text
Deleting the enrollment
also deletes course information.
```

---

# Normalization

## What Is Normalization?

Normalization:

* restructures relations
* reduces redundancy
* reduces anomalies

---

## What Is Normalization? (continued)

Normalization also:

* clarifies dependencies
* improves structure
* improves integrity

---

## Main Rule

```text
Every attribute should describe:

the key,
the whole key,
and nothing but the key.
```

---

# Normalized Design

## Students

| student_id | name  |
| ---------- | ----- |
| 1          | Alice |
| 2          | Bob   |

---

## Professors

| professor_id | name    |
| ------------ | ------- |
| 10           | Ionescu |
| 11           | Popescu |

---

## Courses

| course_code | name              |
| ----------- | ----------------- |
| DBSEC       | Database Security |
| NET         | Networks          |

---

## Enrollments

| student_id | course_code | grade |
| ---------- | ----------- | ----: |
| 1          | DBSEC       |     9 |
| 1          | NET         |     8 |
| 2          | DBSEC       |    10 |

---

## What Improved?

* student facts stored once
* course facts stored once

---

## What Improved? (continued)

* professor facts stored once
* enrollments represented directly

---

# Keys

## Superkey

A superkey uniquely identifies rows.

Examples:

```text
student_id
email
student_id + email
```

---

## Candidate Key

A candidate key is:

```text
A minimal superkey.
```

---

## Primary Key

The chosen candidate key.

Example:

```text
student_id
```

---

# Foreign Keys

## Foreign Key

A foreign key references another relation.

---

## Foreign Key Example

```text
Courses.professor_id
->
Professors.professor_id
```

---

## Foreign Keys Help Enforce

* referential integrity
* ownership structure

---

## Foreign Keys Help Enforce (continued)

* consistency
* safer deletes

---

# Dependencies

## Functional Dependency

Example:

```text
student_id -> student_name
course_code -> course_name
```

---

## Meaning of Dependency

```text
Knowing the left side determines the right side.
```

---

## Dependencies Help Decide

* where attributes belong
* which tables should exist

---

## Dependencies Help Decide (continued)

* which decompositions are correct

---

# First Normal Form

## 1NF

A relation is in 1NF if:

* one value per cell
* no repeating groups
* no lists inside attributes

---

## 1NF Bad Example

| student_id | phones         |
| ---------- | -------------- |
| 1          | 0711,0722,0733 |

---

## Problem

```text
phones contains multiple values.
```

---

## Better Design

### Students

| student_id | name  |
| ---------- | ----- |
| 1          | Alice |

---

## Better Design (continued)

### StudentPhones

| student_id | phone |
| ---------- | ----- |
| 1          | 0711  |
| 1          | 0722  |
| 1          | 0733  |

---

# Second Normal Form

## 2NF

A relation is in 2NF if:

* it is in 1NF
* it contains no partial dependencies

---

## Partial Dependency

Definition:

```text
A non-key attribute depends
on only part of a composite key.
```

---

## 2NF Example

| student_id | course_code | student_name |
| ---------- | ----------- | ------------ |
| 1          | DBSEC       | Alice        |

---

## Composite Key

```text
(student_id, course_code)
```

---

## Dependencies

```text
student_id -> student_name
course_code -> course_name
```

---

## Problem

```text
student_name depends only on student_id
course_name depends only on course_code
```

---

## Partial Dependencies

These are:

```text
Partial dependencies.
```

---

## 2NF Fix

Split into:

* Students
* Courses
* Enrollments

---

## 2NF Result

```text
Each attribute depends on the whole key.
```

---

# Third Normal Form

## 3NF

A relation is in 3NF if:

* it is in 2NF
* it contains no transitive dependencies

---

## Transitive Dependency

Definition:

```text
A non-key attribute depends
on another non-key attribute.
```

---

## General Form

```text
A -> B
B -> C

therefore

A -> C
```

---

## 3NF Example

| student_id | group_id | group_tutor |
| ---------- | -------- | ----------- |
| 1          | A1       | Ionescu     |
| 2          | A1       | Ionescu     |

---

## Dependencies

```text
student_id -> group_id
group_id -> group_tutor
```

---

## Derived Dependency

```text
student_id -> group_tutor
```

---

## Problem

```text
group_tutor depends on group_id,
not directly on student_id.
```

---

## This Is

```text
A transitive dependency.
```

---

## 3NF Fix

Split into:

* Students
* Groups

---

## 3NF Result

```text
group_tutor belongs to Groups
```

---

# BCNF

## BCNF

Boyce-Codd Normal Form:

```text
Every determinant must be a key.
```

---

## Why BCNF Exists

3NF still allows:

```text
Dependencies where the determinant
is not a candidate key.
```

---

## BCNF Example

```text
student, course -> instructor
instructor -> course
```

---

## BCNF Problem

```text
instructor determines course
but instructor is not a key.
```

---

# Fourth Normal Form

## 4NF

4NF removes:

```text
Multivalued dependency anomalies
```

---

## 4NF Example

| student | language | hobby  |
| ------- | -------- | ------ |
| Alice   | English  | Chess  |
| Alice   | English  | Hiking |

---

## 4NF Example (continued)

| student | language | hobby  |
| ------- | -------- | ------ |
| Alice   | French   | Chess  |
| Alice   | French   | Hiking |

---

## 4NF Problem

```text
Languages and hobbies are independent.
```

---

## 4NF Problem (continued)

```text
The table creates artificial combinations.
```

---

## 4NF Fix

```text
StudentLanguages
StudentHobbies
```

---

# Fifth Normal Form

## 5NF

5NF removes:

```text
Join dependency anomalies
```

---

## Main Idea

```text
A relation may be reconstructible
from smaller relations.
```

---

## Consequence

```text
The larger relation may contain redundant combinations.
```

---

# DKNF and 6NF

## DKNF

Domain-Key Normal Form:

```text
All constraints should be expressible
through domains and keys.
```

---

## 6NF

Mostly useful for:

* temporal databases
* independently changing attributes

---

## 6NF (continued)

Mostly useful for:

* historical tracking

---

# Denormalization

## Denormalization

Intentional redundancy for:

* performance
* faster reads
* simpler queries

---

## Example

Store:

```text
Orders.total
```

---

## Example (continued)

Even though it can be computed from:

```text
OrderItems
```

---

## Trade-Off

```text
If items change,
the total must also change.
```

---

# Normalization vs Denormalization

## Normalization Favors

* correctness
* integrity
* easier updates

---

## Normalization Favors (continued)

* less redundancy

---

## Denormalization Favors

* faster reads
* fewer joins
* optimized queries

---

# Security Impact

## Database Design Affects Security

Poor design may create:

* duplicated permissions
* orphaned records

---

## Database Design Affects Security (continued)

Poor design may create:

* unclear ownership
* inconsistent access control

---

## Ownership Example

```text
User -> Organization
Organization -> Project
Project -> Document
```

---

## Why Ownership Matters

```text
Ownership relationships affect authorization.
```

---

# Design Checklist

## Design Questions

1. What are the entities?
2. What are the identifiers?
3. What relationships exist?

---

## Design Questions (continued)

4. What facts are duplicated?
5. What dependencies exist?
6. Which constraints belong in the database?

---

# Normalization Cheat Sheet

## Cheat Sheet

| NF  | Main Problem            |
| --- | ----------------------- |
| 1NF | repeating groups        |
| 2NF | partial dependencies    |
| 3NF | transitive dependencies |

---

## Cheat Sheet (continued)

| NF   | Main Problem             |
| ---- | ------------------------ |
| BCNF | non-key determinants     |
| 4NF  | multivalued dependencies |
| 5NF  | join dependencies        |

---

# Summary

## Main Ideas

* bad design creates anomalies
* normalization reduces anomalies

---

## Main Ideas (continued)

* dependencies determine structure
* denormalization is sometimes useful

---

## Main Ideas (continued)

* design affects security directly

---

# Discussion Questions

## Questions

1. Why are large tables attractive initially?
2. Why are duplicated roles dangerous?

---

## Questions (continued)

3. Why does 2NF matter for composite keys?
4. Why does 3NF reduce hidden dependencies?

---

## Questions (continued)

5. When is denormalization justified?
