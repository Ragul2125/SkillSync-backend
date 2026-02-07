import { geminiModel, CONFIG } from './config.js';

/**
 * Sleep utility for retry delays
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generates reasoning for why candidates match the user profile using Gemini AI.
 * Includes retry logic with exponential backoff for rate limit errors.
 * 
 * @param {Object} userProfile - The current user's profile data.
 * @param {Object[]} candidates - Array of candidate objects returned from vector search.
 * @param {number} retries - Number of retry attempts (default: 3)
 * @returns {Promise<Object>} - Structured JSON with reasoning.
 */
export const generateMatchReasoning = async (userProfile, candidates, retries = 3) => {
  // Construct the context from candidates
  const candidatesContext = candidates.map((c, i) =>
    `Candidate ${i + 1}: Name: ${c.name || c.title}, Skills: ${c.skills?.join(', ') || c.techStack?.join(', ')}, Bio/Desc: ${c.bio || c.description}`
  ).join("\n\n");

  const prompt = `You are an expert AI recruiter matching profiles.
    
Target User Profile:
Name: ${userProfile.name}
Skills: ${Array.isArray(userProfile.skills) ? userProfile.skills.join(', ') : userProfile.skills}
Bio: ${userProfile.bio || 'Not provided'}

Top Matched Candidates (found via semantic search):
${candidatesContext}

Task:
Analyze these candidates and explain WHY they are a good match for the Target User.
Return the response in strictly valid JSON format like this:
{
  "matches": [
    {
      "candidateName": "Name of candidate",
      "matchPercentage": 95,
      "reasoning": "One sentence explaining the synergy between specific skills."
    }
  ]
}

Only return valid JSON, no additional text.`;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const result = await geminiModel.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Clean up response - remove markdown code blocks if present
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

      return JSON.parse(cleanedText);

    } catch (error) {
      // Check if it's a rate limit error (429)
      if (error.status === 429 && attempt < retries - 1) {
        const delay = Math.pow(2, attempt + 1) * 1000; // Exponential backoff: 2s, 4s, 8s
        console.log(`⏳ Rate limit hit, retrying in ${delay / 1000}s... (attempt ${attempt + 1}/${retries})`);
        await sleep(delay);
        continue;
      }

      // If not a rate limit error or out of retries, throw
      console.error("Error generating match reasoning:", error);
      throw new Error("Failed to generate AI reasoning");
    }
  }

  throw new Error("Failed to generate AI reasoning after retries");
};
