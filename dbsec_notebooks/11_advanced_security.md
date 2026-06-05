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
