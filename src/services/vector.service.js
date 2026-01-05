import { QdrantClient } from '@qdrant/js-client-rest';
import { aiService } from './ai.service.js';
import crypto from 'crypto';

class VectorService {
    constructor() {
        this.client = null;
        this.collectionName = 'code_snippets';
        this.vectorSize = 384; // Matches all-MiniLM-L6-v2
        this.initialized = false;
    }

    async connect() {
        if (this.initialized) return;

        const url = process.env.QDRANT_URL || 'http://localhost:6333';
        try {
            this.client = new QdrantClient({ url });

            // Check if collection exists
            const collections = await this.client.getCollections();
            const exists = collections.collections.find(c => c.name === this.collectionName);

            if (!exists) {
                console.log(`Creating Qdrant collection: ${this.collectionName}`);
                await this.client.createCollection(this.collectionName, {
                    vectors: {
                        size: this.vectorSize,
                        distance: 'Cosine',
                    },
                });
            }

            console.log('✅ Connected to Qdrant Vector DB');
            this.initialized = true;
        } catch (error) {
            console.warn('⚠️ Qdrant Connection Failed (Is docker running?):', error.message);
        }
    }

    /**
     * Store a code snippet in Vector DB
     */
    async storeCode(userId, code, metadata = {}) {
        if (!this.initialized) await this.connect();
        if (!this.client) return;

        try {
            const vector = await aiService.embedText(code);
            if (!vector || vector.length === 0) return;

            const pointId = crypto.randomUUID(); // Requires node 19+ or polyfill, using validation

            await this.client.upsert(this.collectionName, {
                wait: true,
                points: [
                    {
                        id: pointId,
                        vector: vector,
                        payload: {
                            userId,
                            code,
                            timestamp: Date.now(),
                            ...metadata
                        }
                    }
                ]
            });
            console.log(`Saved vector for user ${userId}`);
        } catch (error) {
            console.error('Vector Store Error:', error.message);
        }
    }

    /**
     * Search for similar code
     */
    async searchSimilar(userId, query, limit = 3) {
        if (!this.initialized) await this.connect();
        if (!this.client) return [];

        try {
            const vector = await aiService.embedText(query);
            if (!vector) return [];

            const results = await this.client.search(this.collectionName, {
                vector,
                limit,
                filter: {
                    must: [
                        { key: 'userId', match: { value: userId } }
                    ]
                }
            });

            return results; // [{ id, score, payload: { code, ... } }]
        } catch (error) {
            console.error('Vector Search Error:', error.message);
            return [];
        }
    }
}

export const vectorService = new VectorService();
