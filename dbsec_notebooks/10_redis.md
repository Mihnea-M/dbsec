# DBSEC 10 — Redis Data Structures, Pub/Sub, Streams, and ACLs

## Repository category

- `10-redis/*.js`
- `10-redis/security/notes`

## Learning goals

- Use Redis strings, lists, sets, sorted sets, hashes, pub/sub, and streams.
- Understand Redis as cache, queue, and session store.
- Apply authentication and ACL basics.

## Detailed concept explanation

### Redis as an in-memory data store

Redis is fast because it stores data primarily in memory. It is commonly used for caching, sessions, queues, rate limiting, locks, pub/sub, and streams.
Speed makes it attractive, but sensitive temporary data can leak if Redis is exposed or unauthenticated.

### Data structures

Redis is not just key-value strings. It supports lists, sets, sorted sets, hashes, streams, and pub/sub channels. Each structure fits different access
patterns: sets for membership, sorted sets for priority queues, streams for event logs, and hashes for object-like records.

### Redis security

Redis should not be publicly exposed. Use authentication, ACLs, network restrictions, protected mode, TLS when appropriate, and careful key naming.
Avoid storing long-lived secrets unless protected with strong controls.

## Code snippets and explanations

### Strings operations

**Source:** `10-redis/strings.js`

```js
await client.set('user:name:1', 'jim')
await client.set('user:counter:1', 0)
await client.incr('user:counter:1')
let result = await client.getSet('user:name:1', 'john')
await client.append('user:name:1', ' smith')
result = await client.get('user:name:1')
```

This demonstrates basic string storage, counters, atomic increment, get-and-set, and append. Atomic operations make Redis useful for counters and rate
limits.

### Sets and intersection

**Source:** `10-redis/sets.js`

```js
await client.sAdd('assets:1', '1')
await client.sAdd('assets:1', '2')
await client.sAdd('assets:2', '1')
await client.sAdd('assets:2', '5')

let result = await client.sInter(['assets:1', 'assets:2'])
console.log(result)
```

Sets store unique members. Intersection can model shared access, overlapping permissions, common tags, or mutual membership.

### Pub/sub producer

**Source:** `10-redis/pubsub-producer.js`

```js
while (!done) {
  const value = await askQuestion('task: ')
  if (value.trim() === 'quit') break
  client.publish('tasks:1', value)
}
```

Pub/sub broadcasts messages to subscribers. It is ephemeral: if no subscriber is listening, the message is not stored.

### Stream consumer group

**Source:** `10-redis/stream-consumer.js`

```js
const response = await client.xReadGroup(groupName, consumerName, {
  key: streamKey,
  id: '>',
}, { COUNT: 10, BLOCK: 5000 })

await client.xAck(streamKey, groupName, message.id)
```

Streams persist events and consumer groups track delivery. Acknowledgement tells Redis that a message was processed.

### Redis ACL example

**Source:** `10-redis/security/notes`

```redis
CONFIG SET requirepass welcome123
AUTH default welcome123

ACL SETUSER someone on >somepass ~tests:* +@all
AUTH someone somepass

SET tests:1 somevalue
SET xxx:1 somevalue
```

The user `someone` is enabled, assigned a password, and limited to keys matching `tests:*`. The final write to `xxx:1` should be forbidden because it
does not match the key pattern.

## Review checklist

- Which Redis structure fits queues? sets? event logs?
- Why is pub/sub not durable?
- How do ACL key patterns reduce blast radius?
