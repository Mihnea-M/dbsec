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
