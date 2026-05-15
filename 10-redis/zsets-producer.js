import redis from 'redis'
import readline from 'readline'

function askQuestion(query) {
  const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
  })
  return new Promise(resolve => rl.question(query, ans => {
      rl.close()
      resolve(ans)
  }))
}

try {
  // Create a Redis client'
  const client = redis.createClient()
  await client.connect()
  let done = false
  while (!done) {
    const value = await askQuestion('Value/prio: ')
    if (value.trim() === 'quit') {
      break
    }
    const [item, priority] = value.trim().split(' ')
    console.log(item)
    console.log(priority)
    await client.zAdd('tasks:1', [{ score: priority, value: item}])
  }
  await client.quit()
} catch (error) {
  console.warn(error)
}