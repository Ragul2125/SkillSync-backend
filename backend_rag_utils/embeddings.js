import { pipeline } from '@xenova/transformers';
import { CONFIG } from './config.js';

// Initialize the embedding pipeline (lazy-loaded on first use)
let embeddingPipeline = null;

/**
 * Generates a vector embedding for the given text using Hugging Face sentence transformers.
 * @param {string} text - The input text (e.g., combined skills + bio).
 * @returns {Promise<number[]>} - The embedding vector.
 */
export const generateEmbedding = async (text) => {
    try {
        // Sanitize input
        const cleanText = text.replace(/\n/g, " ").trim();

        if (!cleanText) {
            throw new Error("Input text cannot be empty");
        }

        // Initialize pipeline on first use
        if (!embeddingPipeline) {
            console.log("Loading embedding model...");
            embeddingPipeline = await pipeline('feature-extraction', CONFIG.EMBEDDING_MODEL);
        }

        // Generate embedding
        const output = await embeddingPipeline(cleanText, { pooling: 'mean', normalize: true });

        // Convert to regular array
        const embedding = Array.from(output.data);

        return embedding;
    } catch (error) {
        console.error("Error generating embedding:", error);
        throw new Error("Failed to generate embedding");
    }
};
