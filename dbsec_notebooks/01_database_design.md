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
