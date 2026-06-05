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
