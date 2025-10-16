import Redis from 'ioredis';

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = process.env.REDIS_PORT || 6379;

export const redisClient = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    console.log(`Redis reconnecting in ${delay}ms...`);
    return delay;
  },
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('Redis connected');
});

redisClient.on('ready', () => {
  console.log('Redis ready');
});

export async function initRedis() {
  // Wait for Redis to be ready
  if (redisClient.status === 'ready') {
    return;
  }
  
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Redis connection timeout'));
    }, 5000);
    
    redisClient.once('ready', () => {
      clearTimeout(timeout);
      resolve();
    });
    
    redisClient.once('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

// Redis keys
export const KEYS = {
  STATE: 'runners:state',
  EVENTS: 'runners:events'
};