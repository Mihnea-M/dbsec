const { createClient } = require('redis');

async function runProducer() {
  const client = createClient();
  await client.connect();

  const streamKey = 'mystream';

  // Add messages to stream
  for (let i = 0; i < 5; i++) {
    const id = await client.xAdd(streamKey, '*', {
      event: `event_${i}`,
      timestamp: Date.now().toString()
    });
    console.log(`Produced event with ID: ${id}`);
  }

  await client.quit();
}

runProducer().catch(console.error);
