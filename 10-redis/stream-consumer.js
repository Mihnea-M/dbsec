const { createClient } = require('redis');

async function runConsumer() {
  const client = createClient();
  await client.connect();

  const streamKey = 'mystream';
  const groupName = 'mygroup';
  const consumerName = `consumer-${Math.random().toString(36).slice(2, 8)}`;

  try {
    await client.xGroupCreate(streamKey, groupName, '0', { MKSTREAM: true });
    console.log(`Consumer group '${groupName}' created.`);
  } catch (err) {
    if (!err.message.includes('BUSYGROUP')) {
      throw err;
    }
    console.log(`Consumer group '${groupName}' already exists.`);
  }

  console.log(`Consumer ${consumerName} is listening...`);

  while (true) {
    const response = await client.xReadGroup(groupName, consumerName, {
      key: streamKey,
      id: '>',
    }, { COUNT: 10, BLOCK: 5000 });

    if (response) {
      for (const stream of response) {
        for (const message of stream.messages) {
          console.log(`Consumer ${consumerName} got message:`, message);
          // Acknowledge message
          await client.xAck(streamKey, groupName, message.id);
        }
      }
    }
  }
}

runConsumer().catch(console.error);
