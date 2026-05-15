# DBSEC - Section 02: Database Design

## Anomalies, Normalization, Denormalization, and Design Trade-Offs

**Duration:** 60 minutes
**Position in course:** After the introductory database models section
**Deliverables:** A normalized database based on a raw project description
**Purpose:** Understand how poor database structure creates anomalies, and how normalization helps produce safer, clearer, and more maintainable database models.

---

## 1. Why Database Design Matters

Database design is the process of deciding how real-world information becomes stored data.

A good design helps us answer:

* What entities exist?
* What attributes describe each entity?
* Which attributes identify an entity?
* Which relationships exist between entities?
* Which constraints must always hold?
* Which facts should be stored once?
* Which facts may be duplicated intentionally?

Database design matters because data usually outlives application code.

Applications change. Interfaces change. Frameworks change. But the stored data often remains and continues to support multiple services, reports, scripts, integrations, and users.

---

## 2. Database Design and Integrity

One important goal of database design is to move part of the responsibility for data integrity from the application layer into the database layer.

Example:

```text
Application-only integrity:
The application checks that every order belongs to an existing user.

Database-level integrity:
A foreign key prevents an order from referencing a user that does not exist.
```

This is important because application checks can be bypassed or implemented inconsistently.

Database-level constraints can protect the data even when:

* a developer forgets a validation check
* a script writes directly to the database
* a second application uses the same database
* an attacker reaches an unexpected endpoint
* a migration accidentally introduces invalid data

Good design makes the database model easier to explain, maintain, secure, and audit.

---

## 3. From Real Life to Data Model

A database model should represent real-world facts in a way that preserves their meaning.

Example domain: university courses.

Real-world facts:

```text
A student has a student number.
A course has a course code.
A professor teaches a course.
A student enrolls in a course.
A student receives a grade for a course.
```

Possible entities:

```text
Students
Courses
Professors
Enrollments
Grades
```

Possible relationships:

```text
A student can enroll in many courses.
A course can have many students.
A professor can teach many courses.
An enrollment connects one student to one course.
```

A bad model mixes these facts in ways that create duplication and anomalies.

A good model separates facts according to what they describe.

---

## 4. Basic Terms

| Conceptual term   | SQL implementation term        | Meaning                                    |
| ----------------- | ------------------------------ | ------------------------------------------ |
| Relation          | Table                          | A set of tuples with the same attributes   |
| Attribute         | Column                         | A named property of a relation             |
| Tuple             | Row                            | One record in a relation                   |
| Domain            | Column type or valid value set | The allowed values for an attribute        |
| Relational schema | Database design                | The structure of relations and constraints |

Example:

```text
Relation / table: Students
Attributes / columns: id, name, email, group_name
Tuple / row: (1, "Alice", "alice@example.com", "A1")
Domain: group_name must be a valid academic group
```

A relation is not just a visual table. It is a set of facts with rules.

---

## 5. Example of a Raw Table

Imagine the following initial table:

| student_id | student_name | student_email                                 | course_code | course_name       | professor_name | professor_email                           | grade |
| ---------- | ------------ | --------------------------------------------- | ----------- | ----------------- | -------------- | ----------------------------------------- | ----: |
| 1          | Alice        | [alice@example.com](mailto:alice@example.com) | DBSEC       | Database Security | Dr. Ionescu    | [ion@uni.example](mailto:ion@uni.example) |     9 |
| 1          | Alice        | [alice@example.com](mailto:alice@example.com) | NET         | Networks          | Dr. Popescu    | [pop@uni.example](mailto:pop@uni.example) |     8 |
| 2          | Bob          | [bob@example.com](mailto:bob@example.com)     | DBSEC       | Database Security | Dr. Ionescu    | [ion@uni.example](mailto:ion@uni.example) |    10 |

At first glance, this table is easy to read.

But it mixes several kinds of facts:

* facts about students
* facts about courses
* facts about professors
* facts about enrollments
* facts about grades

This creates redundancy and anomalies.

---

## 6. Redundancy

Redundancy means the same fact is stored more than once.

In the raw table:

```text
Alice's name and email appear once for each course she takes.
The DBSEC course name appears once for each enrolled student.
Dr. Ionescu's name and email appear once for each student in DBSEC.
```

Redundancy is not automatically bad. Sometimes we intentionally duplicate data for performance.

But uncontrolled redundancy creates risks:

* larger storage usage
* slower updates
* inconsistent values
* unclear source of truth
* more complicated access control
* more complicated deletion and privacy handling

---

## 7. Anomalies in Data

An anomaly is a situation where data that should be handled separately cannot be handled separately.

This means the database cannot correctly represent real-life circumstances.

The main anomaly types are:

* insert anomalies
* update anomalies
* delete anomalies

Anomalies are structural problems. They appear because of the way the data is modeled.

---

## 8. Insert Anomalies

An insert anomaly appears when some data cannot be inserted until other unrelated data is also available.

Using the raw table:

```text
We want to add a new course called CRYPTO.
No student is enrolled yet.
```

Problem:

```text
The table stores courses only inside enrollment rows.
If there is no student, there is no row where the course can be stored.
```

Another example:

```text
We want to add a new professor who has not yet been assigned to a course.
```

If professor data only appears inside course enrollment rows, the professor cannot be represented independently.

---

## 9. Update Anomalies

An update anomaly appears when updating one or more data items creates inconsistencies.

Using the raw table:

```text
Dr. Ionescu changes email address.
```

The email may appear in many rows:

```text
ion@uni.example
ion@uni.example
ion@uni.example
```

If only some rows are updated, the database now contains contradictory facts:

```text
Dr. Ionescu -> ion@uni.example
Dr. Ionescu -> ionescu@uni.example
```

This is dangerous because different queries may return different answers.

Security example:

```text
A user's role is duplicated in multiple tables.
One copy is changed from admin to user.
Another copy still says admin.
The system may continue granting excessive access.
```

---

## 10. Delete Anomalies

A delete anomaly appears when deleting one fact accidentally deletes another fact that should be preserved.

Using the raw table:

```text
Bob drops DBSEC.
Bob was the last student enrolled in DBSEC.
```

If we delete Bob's enrollment row, we may also delete the only stored information about:

```text
DBSEC
Database Security
Dr. Ionescu as professor for DBSEC
```

The problem is that the table stores course information only as part of enrollment information.

Facts with different lifetimes should often be stored separately.

---

## 11. Normalization

Normalization is the process of restructuring data by splitting it into additional relations so that anomalies are minimized.

Main goals:

* reduce unnecessary redundancy
* eliminate insert, update, and delete anomalies
* increase model explainability
* make data representation neutral to specific query statistics
* make each attribute describe the key, the whole key, and nothing but the key

Normalization is not only a technical exercise. It is a way to make the database express the meaning of the domain more clearly.

---

## 12. Normalized Version of the Example

Instead of one large table, we split facts into relations.

### Students

| student_id | name  | email                                         |
| ---------- | ----- | --------------------------------------------- |
| 1          | Alice | [alice@example.com](mailto:alice@example.com) |
| 2          | Bob   | [bob@example.com](mailto:bob@example.com)     |

### Professors

| professor_id | name        | email                                     |
| ------------ | ----------- | ----------------------------------------- |
| 10           | Dr. Ionescu | [ion@uni.example](mailto:ion@uni.example) |
| 11           | Dr. Popescu | [pop@uni.example](mailto:pop@uni.example) |

### Courses

| course_code | name              | professor_id |
| ----------- | ----------------- | ------------ |
| DBSEC       | Database Security | 10           |
| NET         | Networks          | 11           |

### Enrollments

| student_id | course_code | grade |
| ---------- | ----------- | ----: |
| 1          | DBSEC       |     9 |
| 1          | NET         |     8 |
| 2          | DBSEC       |    10 |

Now each relation stores a more focused set of facts.

---

## 13. What Improved?

The normalized design improves several things.

### Student facts are stored once

```text
Alice's email is stored in Students, not repeated for every course.
```

### Course facts are stored once

```text
The DBSEC course name is stored in Courses, not repeated for every enrolled student.
```

### Professor facts are stored once

```text
Dr. Ionescu's email is stored in Professors, not repeated for every DBSEC row.
```

### Enrollments are represented directly

```text
Enrollments connects students to courses.
The grade belongs to the enrollment, not only to the student or only to the course.
```

The model is now easier to explain and safer to update.

---

## 14. Keys

Keys identify tuples.

### Superkey

A superkey is a set of attributes that uniquely identifies a row.

### Candidate Key

A candidate key is a minimal superkey.

### Primary Key

A primary key is the candidate key selected by the designer as the main identifier.

---

## 15. Foreign Keys

A foreign key is an attribute, or group of attributes, that references a key in another relation.

Example:

```text
Courses(course_code, name, professor_id)
Professors(professor_id, name, email)
```

`Courses.professor_id` references `Professors.professor_id`.

This means:

```text
A course cannot reference a professor that does not exist.
```

Foreign keys help preserve referential integrity.

---

## 16. Dependencies

A dependency means that one set of attributes determines another set of attributes.

Example:

```text
student_id -> student_name, student_email
course_code -> course_name
professor_email -> professor_name
student_id, course_code -> grade
```

Dependencies tell us where attributes belong.

If an attribute depends on the wrong key, the table probably needs to be split.

---

## 17. Trivial Dependencies

A dependency is trivial if the right side is already included in the left side.

Example:

```text
student_id, course_code -> course_code
```

Trivial dependencies do not tell us much about the structure of the model.

---

## 18. Principles of Normalization

A normal form is a set of conditions that must be respected by the defined relations.

Normalization works in stages.

Each stage brings the relations into a stricter normal form.

Important principles:

* higher normal forms usually impose stricter conditions
* a schema in a higher normal form is also in the lower normal forms
* higher normal forms correct subtler anomalies
* higher normal forms can lead to many tables
* in practice, higher normal forms are used selectively

---

## 19. Normal Forms in Order of Strictness

```text
1NF  - First Normal Form
2NF  - Second Normal Form
3NF  - Third Normal Form
BCNF - Boyce-Codd Normal Form
4NF  - Fourth Normal Form
5NF  - Fifth Normal Form
DKNF - Domain-Key Normal Form
6NF  - Sixth Normal Form
```

For most practical application design, the most important ones are:

```text
1NF
2NF
3NF
BCNF
```

---

## 20. First Normal Form: 1NF

A relation is in 1NF when:

* every row-column intersection contains one value
* there are no list-valued attributes
* there are no repeating groups
* each tuple is unique

Bad example:

| student_id | name  | phones         |
| ---------- | ----- | -------------- |
| 1          | Alice | 0711,0722,0733 |

Problem:

```text
phones contains a list of values inside one cell.
```

Improved design:

### Students

| student_id | name  |
| ---------- | ----- |
| 1          | Alice |

### StudentPhones

| student_id | phone |
| ---------- | ----- |
| 1          | 0711  |
| 1          | 0722  |
| 1          | 0733  |

---

## 21. Additional Relational Conditions

A relational table is not the same as a spreadsheet.

A spreadsheet often depends on:

* visual layout
* ordering
* merged cells
* repeated columns

A relation should be understandable through explicit attributes, keys, and constraints.

---

## 22. Second Normal Form: 2NF

A relation is in 2NF if:

* it is in 1NF
* it contains no partial dependencies

### What is a partial dependency?

A partial dependency appears when:

```text
A non-key attribute depends on only part of a composite candidate key.
```

This problem exists only when:

```text
The relation has a composite key.
```

Bad table:

| student_id | course_code | student_name | course_name       | grade |
| ---------- | ----------- | ------------ | ----------------- | ----: |
| 1          | DBSEC       | Alice        | Database Security |     9 |
| 1          | NET         | Alice        | Networks          |     8 |
| 2          | DBSEC       | Bob          | Database Security |    10 |

Candidate key:

```text
(student_id, course_code)
```

Dependencies:

```text
student_id -> student_name
course_code -> course_name
student_id, course_code -> grade
```

Problem:

```text
student_name depends only on student_id
course_name depends only on course_code
```

These are partial dependencies because the attributes depend on part of the composite key, not the whole key.

2NF removes partial dependencies.

---

## 23. Fixing the 2NF Problem

### Students

| student_id | student_name |
| ---------- | ------------ |
| 1          | Alice        |
| 2          | Bob          |

### Courses

| course_code | course_name       |
| ----------- | ----------------- |
| DBSEC       | Database Security |
| NET         | Networks          |

### Enrollments

| student_id | course_code | grade |
| ---------- | ----------- | ----: |
| 1          | DBSEC       |     9 |
| 1          | NET         |     8 |
| 2          | DBSEC       |    10 |

Now:

```text
student_name depends on student_id
course_name depends on course_code
grade depends on student_id and course_code together
```

---

## 24. Third Normal Form: 3NF

A relation is in 3NF if:

* it is in 2NF
* it contains no transitive dependencies

### What is a transitive dependency?

A transitive dependency appears when:

```text
A non-key attribute depends on another non-key attribute,
instead of depending directly on the key.
```

General form:

```text
A -> B
B -> C
therefore
A -> C
```

Example:

| student_id | student_name | group_id | group_tutor |
| ---------- | ------------ | -------- | ----------- |
| 1          | Alice        | A1       | Dr. Ionescu |
| 2          | Bob          | A1       | Dr. Ionescu |
| 3          | Carla        | B1       | Dr. Popescu |

Primary key:

```text
student_id
```

Dependencies:

```text
student_id -> group_id
group_id -> group_tutor
```

Therefore:

```text
student_id -> group_tutor
```

Problem:

```text
group_tutor depends on group_id,
not directly on student_id.
```

This is a transitive dependency.

3NF removes transitive dependencies.

---

## 25. Fixing the 3NF Problem

### Students

| student_id | student_name | group_id |
| ---------- | ------------ | -------- |
| 1          | Alice        | A1       |
| 2          | Bob          | A1       |
| 3          | Carla        | B1       |

### Groups

| group_id | group_tutor |
| -------- | ----------- |
| A1       | Dr. Ionescu |
| B1       | Dr. Popescu |

Now:

```text
student_name and group_id describe the student
group_tutor describes the group
```

---

## 26. Progression of Normal Forms

### 1NF removes:

```text
Repeating groups
Lists inside cells
Non-atomic values
```

### 2NF removes:

```text
Partial dependencies
```

Meaning:

```text
Attributes depending on only part of a composite key
```

### 3NF removes:

```text
Transitive dependencies
```

Meaning:

```text
Non-key attributes depending on other non-key attributes
```

### BCNF removes:

```text
Determinant anomalies
```

### 4NF removes:

```text
Multivalued dependency anomalies
```

### 5NF removes:

```text
Join dependency anomalies
```

---

## 27. Boyce-Codd Normal Form: BCNF

BCNF is stricter than 3NF.

A relation is in BCNF if every non-trivial dependency has a superkey on the left side.

Simplified:

```text
Every determinant must be a key.
```

### Why BCNF Exists

3NF still allows situations where:

```text
A determinant is not a candidate key.
```

BCNF removes these additional anomalies.

Example:

| student | course | instructor |
| ------- | ------ | ---------- |
| Alice   | DBSEC  | Ionescu    |
| Bob     | DBSEC  | Ionescu    |
| Alice   | NET    | Popescu    |

Assume:

```text
student, course -> instructor
instructor -> course
```

Problem:

```text
instructor determines course
instructor is not a superkey
```

Possible split:

```text
InstructorCourses(instructor, course)
StudentInstructors(student, instructor)
```

---

## 28. Fourth Normal Form: 4NF

4NF addresses multivalued dependencies.

Example bad table:

| student | language | hobby  |
| ------- | -------- | ------ |
| Alice   | English  | Chess  |
| Alice   | English  | Hiking |
| Alice   | French   | Chess  |
| Alice   | French   | Hiking |

Problem:

```text
Languages and hobbies are independent facts.
```

### Multivalued Dependency Notation

```text
student ->-> language
student ->-> hobby
```

This means:

```text
A student may independently have many languages
and many hobbies.
```

Better design:

```text
StudentLanguages(student, language)
StudentHobbies(student, hobby)
```

4NF separates independent multivalued facts.

---

## 29. Fifth Normal Form: 5NF

5NF addresses join dependencies.

A join dependency means a relation can be reconstructed from smaller relations.

Example:

| supplier | product | project |
| -------- | ------- | ------- |
| S1       | P1      | X       |
| S1       | P2      | X       |
| S2       | P1      | Y       |

Possible decomposition:

```text
SupplierProducts
SupplierProjects
ProjectProducts
```

If the large table stores no additional information beyond these combinations, it may violate 5NF.

5NF removes redundancy caused by reconstructible joins.

---

## 30. Domain-Key Normal Form: DKNF

DKNF says all constraints should be expressible as:

* domain constraints
* key constraints

Examples:

```text
grade must be between 1 and 10
email must be unique
status must belong to an allowed set
```

DKNF is theoretically attractive, but difficult to achieve completely in real systems.

---

## 31. Sixth Normal Form: 6NF

6NF is mostly relevant in temporal databases.

Idea:

```text
A user's email changes independently
A user's department changes independently
A user's access level changes independently
```

Separating independently changing facts can make historical modeling easier.

---

## 32. Denormalization

Denormalization intentionally adds redundancy to improve performance.

Example:

```text
Orders(order_id, user_id, total)
OrderItems(order_id, product_id, quantity, unit_price)
```

The total could be computed dynamically, but may be stored directly for performance.

Problem:

```text
If order items change,
the stored total must also change.
```

Denormalization is useful when controlled carefully.

---

## 33. Normalization vs Denormalization

### Normalization favors:

* correctness
* fewer anomalies
* easier updates
* clearer structure

### Denormalization favors:

* faster reads
* fewer joins
* simpler query paths

A good design usually starts normalized, then denormalizes deliberately when necessary.

---

## 34. Security Impact of Database Design

Poor design can cause:

* inconsistent permissions
* duplicated roles
* unclear ownership
* orphaned records
* accidental exposure
* weak audit trails

Good design makes security rules easier to enforce because the relationships are represented clearly.

---

## 35. Design Checklist

1. What are the entities?
2. What are the attributes?
3. What are the identifiers?
4. What relationships exist?
5. What facts are duplicated?
6. What dependencies exist?
7. Which attributes depend on which keys?
8. Can facts be inserted independently?
9. Can facts be updated in one place?
10. Can facts be deleted safely?
11. Which constraints should the database enforce?
12. Which denormalizations are intentional?

---

## 36. Mini Case Study: Project Management App

Entities:

```text
Users
Organizations
Projects
Tasks
Comments
Roles
Permissions
```

Relationships:

```text
Organization -> Projects
Project -> Tasks
Task -> Comments
User -> Task assignments
Role -> Permissions
```

Security questions:

```text
Can a user access only projects in their organization?
Can a role grant permissions only inside one organization?
Can deleted users remain in audit logs?
```

Design and security are directly connected.

---

## 37. Normalization Cheat Sheet

| Normal Form | Main Problem Removed            | Main Idea                                 |
| ----------- | ------------------------------- | ----------------------------------------- |
| 1NF         | Repeating groups                | One value per cell                        |
| 2NF         | Partial dependencies            | Depend on the whole composite key         |
| 3NF         | Transitive dependencies         | Non-key attributes depend only on the key |
| BCNF        | Non-key determinants            | Every determinant must be a key           |
| 4NF         | Multivalued dependencies        | Separate independent multivalued facts    |
| 5NF         | Join dependency redundancy      | Avoid reconstructible redundant joins     |
| DKNF        | Complex constraint structures   | Constraints should be domains or keys     |
| 6NF         | Independent temporal attributes | Separate independently changing facts     |

---

## 38. Summary

Database design is about representing real-world facts clearly and safely.

Bad design creates:

* insert anomalies
* update anomalies
* delete anomalies

Normalization reduces redundancy and anomalies by splitting relations according to dependencies and keys.

Most practical designs focus mainly on:

```text
1NF
2NF
3NF
BCNF
```

Higher normal forms address more subtle problems:

* multivalued dependencies
* join dependencies
* temporal decomposition

Denormalization can improve performance, but must be controlled carefully.

From a security perspective, good design improves:

* ownership clarity
* permission enforcement
* integrity
* auditability

---

## 39. Discussion Questions

1. Why is a single large table attractive at first?
2. What update anomaly appears if roles are duplicated?
3. Why does 2NF mainly matter for composite keys?
4. Why does 3NF reduce hidden dependencies?
5. When is denormalization justified?
6. How do constraints reduce damage from application bugs?
7. Why is ownership modeling important for authorization?
8. Which is more dangerous: duplicated product names or duplicated user roles? Why?
