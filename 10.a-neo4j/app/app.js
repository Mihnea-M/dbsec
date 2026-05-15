import neo4j from 'neo4j-driver'

// Connect to the database (change credentials if needed)
const driver = neo4j.driver(
  'bolt://localhost:7687', // or 'neo4j://localhost'
  neo4j.auth.basic('neo4j', 'password') // default username/password
);

async function main() {
  const session = driver.session();

  try {
    // Create two nodes and a relationship
    await session.run(`
      CREATE (a:Person {name: 'Alice', age: 30})
      CREATE (b:Person {name: 'Bob', age: 25})
      CREATE (a)-[:KNOWS]->(b)
    `);

    // Query the relationship
    const result = await session.run(`
      MATCH (a:Person)-[r:KNOWS]->(b:Person)
      RETURN a.name AS from, b.name AS to
    `);

    result.records.forEach(record => {
      console.log(`${record.get('from')} knows ${record.get('to')}`);
    });
  } catch (err) {
    console.error('Query failed', err);
  } finally {
    await session.close();
    await driver.close();
  }
}

main();
