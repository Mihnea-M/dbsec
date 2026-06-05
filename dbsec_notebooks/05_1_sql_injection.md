# DBSEC 05.1 — SQL Injection Attacks and Prevention

## Repository category

- `5.1-sql-injection/*.js`

## Learning goals

- Understand classic, blind, and time-based SQL injection.
- Understand why string comparison and timing behavior can leak information.
- Apply prepared statements and safe comparison patterns.

## Detailed concept explanation

### Classic SQL injection

Classic SQL injection happens when attacker-controlled text is inserted into a query string. Payloads such as `' OR '1'='1` can convert a login query
into one that always returns rows.

### Blind SQL injection

Blind injection is used when the application does not print query results but reveals true/false behavior. Attackers can ask yes/no questions, such as
whether the first password character is `a`, and reconstruct secrets slowly.

### Time-based injection

Time-based injection uses delays as a side channel. If a condition is true, the query sleeps; if false, it returns immediately. Even without visible
data, response time leaks information.

### Prevention

The main prevention is prepared statements. Treat user input as values, not query syntax. Also validate input types, use least-privileged database users,
avoid detailed database errors in responses, and use constant-time comparison when comparing secrets in application code.

## Code snippets and explanations

### Classic vulnerable pattern

**Source:** `5.1-sql-injection/classic-injection.js`

```js
const username = answer
const query = `SELECT * FROM users WHERE username = '${username}'`
const [rows] = await connection.execute(query)
```

The username is embedded directly into SQL. A malicious username can close the quote and add SQL operators, changing the WHERE clause.

### Blind injection idea

**Source:** `5.1-sql-injection/blind-test.js`

```js
const targetUser = 'alice'
const maxPasswordLength = 20
const charset = 'abcdefghijklmnopqrstuvwxyz0123456789'
```

The test script tries candidate characters from a charset and observes whether the database/application behavior confirms each guess. This demonstrates
how small leaks can reveal complete secrets.

### Time measurement pattern

**Source:** `5.1-sql-injection/timed-injection.js`

```js
const start = Date.now()
const [rows] = await connection.execute(query)
const end = Date.now()

console.log(`Query took ${end - start} ms`)
```

If an injected condition triggers a delay, the attacker can infer whether the condition was true by measuring response time.

### Prepared-statement prevention

**Source:** `5.1-sql-injection/prevention.js`

```js
const [results] = await connection.execute(
  'SELECT * FROM users WHERE username = ?',
  [username]
)
```

The placeholder prevents username input from becoming SQL syntax. Even if the input contains quotes or operators, it is treated as a string value.

### Constant-time comparison

**Source:** `5.1-sql-injection/safe-string-comparison.js`

```js
import crypto from 'crypto'
crypto.timingSafeEqual(Buffer.from(input), Buffer.from(actualPassword))
```

Normal string comparison may return earlier when the first differing character is found. Constant-time comparison reduces timing leaks, although buffers
must be the same length and passwords should normally be verified through password-hashing libraries.

## Review checklist

- What changes when user input is concatenated into SQL?
- How can an attacker learn secrets without seeing query output?
- Why do prepared statements block SQL injection?
