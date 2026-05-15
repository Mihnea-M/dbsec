import Redis from 'ioredis'

function parseSentinels(rawSentinels) {
  return rawSentinels.split(',').map(entry => {
    const [host, port] = entry.split(':')

    return {
      host,
      port: Number(port)
    }
  })
}

const sentinels = parseSentinels(process.env.REDIS_SENTINELS)

export const redis = new Redis({
  sentinels,
  name: process.env.REDIS_MASTER_NAME || 'mymaster'
})

export async function getCached(key, producer, ttlSeconds = 30) {
  const cached = await redis.get(key)

  if (cached) {
    return {
      source: 'cache',
      value: JSON.parse(cached)
    }
  }

  const value = await producer()

  await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds)

  return {
    source: 'db',
    value
  }
}