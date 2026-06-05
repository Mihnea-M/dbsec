# DBSEC 06 — Node ORM with Sequelize

## Repository category

- `6-node-orm/*.js`
- `6-node-orm/package.json`

## Learning goals

- Connect Sequelize to MySQL.
- Define models and relationships.
- Understand ORM benefits and security limitations.

## Detailed concept explanation

### What an ORM does

An Object-Relational Mapper maps JavaScript objects/classes to relational tables. It helps define models, run queries, create tables, and express
relationships without writing every SQL statement manually.

### Security benefits

ORMs often encourage parameterized queries and centralize schema definitions. This reduces some SQL injection risks and makes validation easier.
However, raw query features can still be unsafe if user input is concatenated.

### Security limitations

An ORM does not automatically solve authorization. You must still check ownership, roles, tenant boundaries, and sensitive-field exposure. ORM models
should reflect security boundaries, not just database convenience.

## Code snippets and explanations

### Create a Sequelize connection

**Source:** `6-node-orm/check-connection.js`

```js
import Sequelize from 'sequelize'

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: 'localhost',
  database: 'test',
  username: 'root',
  password: 'root'
})

await sequelize.authenticate()
await sequelize.close()
```

`authenticate()` checks whether the application can connect. In production, credentials should come from environment variables and the database user
should have limited privileges.

### Define a model

**Source:** `6-node-orm/create-tables-1.js`

```js
const Student = sequelize.define('Student', {
  firstName: Sequelize.STRING,
  lastName: Sequelize.STRING,
  email: Sequelize.STRING
})
```

The model defines table columns in JavaScript. Add validation and constraints where possible so application-level rules and database-level rules align.

### Stored procedure call through ORM

**Source:** `6-node-orm/stored-proc.js`

```js
await sequelize.query(
  'CALL concatenate_with_date(:input, @result)',
  { replacements: { input: 'hello' } }
)

const result = await sequelize.query('SELECT @result AS result', { plain: true })
```

Named replacements bind input values safely. Stored procedures can encapsulate logic, but they must be permissioned carefully.

## Review checklist

- What does Sequelize automate?
- What security work remains even when using an ORM?
- When is raw SQL through an ORM dangerous?
