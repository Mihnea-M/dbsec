import redis from 'redis'
import { v4 as uuid } from 'uuid';

try {
  // Create a Redis client
  const client = redis.createClient()
  await client.connect()
  await client.set('user:name:1', 'jim')
  await client.set('user:counter:1', 0)
  await client.incr('user:counter:1')
  let result = await client.getSet('user:name:1', 'john')
  console.log(result)
  await client.append('user:name:1', ' smith')
  result = await client.get('user:name:1')
  console.log(result) 
  let len = await client.strLen('user:name:1')
  result = await client.getRange('user:name:1', 5, len)
  console.log(result)
  await client.quit()
} catch (error) {
  console.warn(error)
}