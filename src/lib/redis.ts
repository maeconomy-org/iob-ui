import { Redis } from 'ioredis'

// Set different URLs for different environments
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'

// Create Redis client with some sensible defaults
const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => {
    // Exponential backoff with a max of 2s
    const delay = Math.min(times * 50, 2000)
    return delay
  },
})

// Handle connection errors
redis.on('error', (error) => {
  console.error('Redis connection error:', error)
})

export default redis
