import redis from 'redis'
import { v4 as uuid } from 'uuid';

try {
  // Create a Redis client
  const client = redis.createClient()
  await client.connect()
  await client.del('assets:1')
  await client.del('assets:2')
  await client.sAdd('assets:1', '1')
  await client.sAdd('assets:1', '2')
  await client.sAdd('assets:1', '3')
  await client.sAdd('assets:2', '1')
  await client.sAdd('assets:2', '5')
  await client.sAdd('assets:2', '7')
  let result = await client.sCard('assets:1')
  result = await client.sInter(['assets:1', 'assets:2'])
  console.log(result)
  result = await client.sMembers('assets:1')
  console.log(result)
  result = await client.sMembers('assets:2')
  console.log(result)
  let cursor = await client.sScan('assets:1', 0)
  console.log(cursor)
  for (const item of cursor.members) {
    console.log(item)
  }
  await client.quit()
} catch (error) {
  console.warn(error)
}