import { Worker, Job } from 'bullmq';
import { CONFIG } from './config';
import { FetchService } from './services/fetch.service';
import type { FetchJobData, FetchResult } from './types';

const fetchService = new FetchService();

async function processFetchJob(job: Job<FetchJobData>): Promise<FetchResult> {
  console.log(`Processing job ${job.id} for URL: ${job.data.url}`);

  try {
    const result = await fetchService.fetchPage(job.data);
    console.log(`Job ${job.id} completed successfully`);
    return result;
  } catch (error) {
    console.error(`Job ${job.id} failed:`, error);
    throw error;
  }
}

async function main() {
  await fetchService.initialize();

  const worker = new Worker<FetchJobData, FetchResult>(
    CONFIG.queue.name,
    processFetchJob,
    {
      connection: {
        host: CONFIG.redis.host,
        port: CONFIG.redis.port,
      },
      concurrency: CONFIG.queue.concurrency,
      removeOnComplete: {
        count: 0,
      },
      removeOnFail: {
        count: 0,
      },
    }
  );

  worker.on('completed', (job) => {
    console.log(`Job ${job.id} has been completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} has failed with error:`, err.message);
  });

  worker.on('error', (err) => {
    console.error('Worker error:', err);
  });

  console.log(`Worker started, listening to queue: ${CONFIG.queue.name}`);
  console.log(`Concurrency: ${CONFIG.queue.concurrency}`);

  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, closing worker...');
    await worker.close();
    await fetchService.close();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('SIGINT received, closing worker...');
    await worker.close();
    await fetchService.close();
    process.exit(0);
  });
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

