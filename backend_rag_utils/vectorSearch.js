import { MongoClient } from 'mongodb'; // Assuming native driver or mongoose
import { CONFIG } from './config.js';

/**
 * Performs a vector search on a MongoDB collection.
 * NOTE: This function assumes you are passing a Mongoose Model or accessing the collection directly.
 * 
 * @param {Object} Model - The Mongoose Model (e.g., User, Project).
 * @param {number[]} queryVector - The embedding of the current user/query.
 * @param {number} limit - Number of results to return.
 * @returns {Promise<Object[]>} - List of similar documents.
 */
export const searchSimilarDocuments = async (Model, queryVector, limit = 10) => {
    try {
        const pipeline = [
            {
                "$vectorSearch": {
                    "index": CONFIG.VECTOR_INDEX_NAME,
                    "path": CONFIG.EMBEDDING_PATH,
                    "queryVector": queryVector,
                    "numCandidates": limit * 10, // heuristic: explore 10x the limit
                    "limit": limit
                }
            },
            {
                "$project": {
                    "_id": 1,
                    "title": 1,
                    "name": 1,
                    "skills": 1,
                    "description": 1,
                    "bio": 1,
                    "score": { "$meta": "vectorSearchScore" } // Include similarity score
                }
            }
        ];

        const results = await Model.aggregate(pipeline);
        return results;
    } catch (error) {
        console.error("Error performing vector search:", error);
        throw new Error("Vector search failed");
    }
};
