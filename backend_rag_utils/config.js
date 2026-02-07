import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

// Initialize Gemini AI Client
// Make sure GEMINI_API_KEY is defined in your .env file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

// Configuration Constants
export const CONFIG = {
    EMBEDDING_MODEL: "Xenova/all-MiniLM-L6-v2", // Local Hugging Face model
    GENERATION_MODEL: "gemini-2.5-flash-lite", // Gemini model for reasoning
    VECTOR_INDEX_NAME: "vector_index", // Must match your Atlas Search Index name
    EMBEDDING_PATH: "description_embedding" // The field in MongoDB where vector is stored
};
