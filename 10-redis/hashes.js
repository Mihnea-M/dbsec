import redis from 'redis'
import { v4 as uuid } from 'uuid';

try {
  // Create a Redis client
  const client = redis.createClient()
  await client.connect()
  await client.hSet('user:1', 'username', 'john.smith')
  await client.hSet('user:1', 'type', 'admin')
  let result = await client.hGetAll('user:1')
  console.log(result)  
  result = await client.hKeys('user:1')
  console.log(result)
  result = await client.exists('user:1', 'type')
  console.log(result)
  result = await client.hVals('user:1')
  console.log(result)
  await client.quit()
} catch (error) {
  console.warn(error)
}