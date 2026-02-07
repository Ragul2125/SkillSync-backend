import { computeMatchesForUser } from "../services/ragService.js";
import connectDb from "../config/db.js";
import dotenv from "dotenv";

dotenv.config();

/**
 * Manually trigger match computation for a specific user
 * Usage: node scripts/triggerMatching.js <userId>
 */
async function triggerMatching() {
    try {
        await connectDb();

        const userId = process.argv[2];

        if (!userId) {
            console.log("❌ Please provide a user ID");
            console.log("Usage: node scripts/triggerMatching.js <userId>");
            process.exit(1);
        }

        console.log(`🚀 Triggering match computation for user: ${userId}\n`);

        await computeMatchesForUser(userId);

        console.log("\n✅ Match computation completed!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
}

triggerMatching();
