import { config } from 'dotenv';

config();

export const CONFIG = {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
  nodeEnv: process.env.NODE_ENV || 'development',
  queue: {
    name: 'fetch-queue',
    concurrency: parseInt(process.env.QUEUE_CONCURRENCY || '5', 10),
  },
} as const;
