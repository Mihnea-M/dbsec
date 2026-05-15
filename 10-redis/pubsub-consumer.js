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
  // Create a Redis client
  const client = redis.createClient()
  await client.connect()

  let finished  = false

  await client.subscribe('tasks:1', (task) => {      
    if (task) {
      console.log('Received task:')
      console.log(JSON.parse(task))
    } else {
      finished = true
    }
  })

  while (!finished) {
    const value = await askQuestion('Write "quit" to exit: ')
    if (value.trim() === 'quit') {
      break
    }
  }

  await client.quit()
} catch (error) {
  console.warn(error)
}