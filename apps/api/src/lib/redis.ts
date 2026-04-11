import Redis from 'ioredis'

export const redisAvailable = !!process.env.REDIS_URL

export const redis = redisAvailable
  ? new Redis(process.env.REDIS_URL!, {
      lazyConnect: true,
      maxRetriesPerRequest: 3,
    })
  : null

redis?.on('error', (err) => {
  console.error('[redis] connection error:', err.message)
})
