# DBSEC 10.a — Neo4j Graph Database

## Repository category

- `10.a-neo4j/commands`
- `10.a-neo4j/app/app.js`
- `10.a-neo4j/connect`

## Learning goals

- Understand graph nodes and relationships.
- Run basic Cypher queries.
- Connect Node.js to Neo4j using the official driver.

## Detailed concept explanation

### Graph model

Neo4j stores nodes and relationships. This is natural for social networks, recommendations, dependency graphs, fraud detection, access paths, and
knowledge graphs. Security checks can be graph traversals, but traversal depth and relationship visibility must be controlled.

### Cypher

Cypher is Neo4j's query language. It uses patterns such as `(a:Person)-[:KNOWS]->(b:Person)` to match relationships. Pattern matching is expressive,
but careless queries can reveal indirect relationships.

### Driver sessions

The Node.js driver creates a driver, opens a session, runs Cypher, and closes resources. Credentials and connection strings should be externalized.

## Code snippets and explanations

### Create people nodes and relationships

**Source:** `10.a-neo4j/commands`

```cypher
CREATE (a:Person {name: 'Alice', age: 30});
CREATE (b:Person {name: 'Bob', age: 25});

MATCH (a:Person {name: 'Alice'}), (b:Person {name: 'Bob'})
CREATE (a)-[:KNOWS]->(b);
```

Nodes represent people; the directed `KNOWS` relationship connects them. Graph databases make this relationship first-class rather than hidden in join
tables.

### Match relationships

**Source:** `10.a-neo4j/commands`

```cypher
MATCH (a:Person)-[r:KNOWS]->(b:Person)
RETURN a.name, r, b.name;

MATCH (p:Person)
WHERE p.age > 26
RETURN p.name, p.age;
```

The first query returns connected people. The second filters nodes by property. In secure apps, add access-control restrictions to both node and
relationship queries.

### Node.js driver connection

**Source:** `10.a-neo4j/app/app.js`

```js
import neo4j from 'neo4j-driver'

const driver = neo4j.driver(
  'bolt://localhost:7687',
  neo4j.auth.basic('neo4j', 'password')
)

const session = driver.session()
const result = await session.run('MATCH (p:Person) RETURN p.name AS name')
await session.close()
await driver.close()
```

The app connects over Bolt, authenticates, runs a Cypher query, and closes both session and driver. Avoid hard-coded credentials outside demos.

## Review checklist

- What problems are graphs especially good at?
- How can graph traversal create privacy risks?
- What must be closed after Neo4j queries?
