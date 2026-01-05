import { Queue, Worker } from 'bullmq';
import { vectorService } from './vector.service.js';
import { aiService } from './ai.service.js';

// Parse Redis URL or use default
// BullMQ takes { host, port } or connection string if IoRedis opts
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Setup connection config
const connection = {
    url: redisUrl
};

// 1. The Queue (Producer)
export const aiQueue = new Queue('ai-jobs', { connection });

// 2. The Worker (Consumer)
export const initWorkers = () => {
    // Only start worker if we are in a server context that handles background jobs
    // For simple monolith, we run it here.

    const worker = new Worker('ai-jobs', async (job) => {
        try {
            console.log(`🤖 Job ${job.id} [${job.name}] starting...`);

            switch (job.name) {
                case 'index_code': {
                    const { userId, code, metadata } = job.data;
                    await vectorService.storeCode(userId, code, metadata);
                    break;
                }
                case 'analyze_mastery': {
                    // Placeholder: Periodically analyze user's vector embeddings
                    // to find capability gaps.
                    const { userId } = job.data;
                    console.log('Analyzing mastery for', userId);
                    // RAG Logic would go here
                    break;
                }
                default:
                    console.warn('Unknown job:', job.name);
            }

            return { status: 'success' };
        } catch (e) {
            console.error(`Job ${job.id} Error:`, e);
            throw e;
        }
    }, { connection });

    worker.on('completed', job => console.log(`✅ Job ${job.id} done.`));
    worker.on('failed', (job, err) => console.error(`❌ Job ${job.id} failed: ${err.message}`));

    console.log('👷 AI Workers Initialized');
};
