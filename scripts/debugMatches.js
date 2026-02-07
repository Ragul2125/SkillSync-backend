import Match from "../model/matchModel.js";
import connectDb from "../config/db.js";
import dotenv from "dotenv";

dotenv.config();

/**
 * Debug script to check what's in the Match collection
 */
async function debugMatches() {
    try {
        await connectDb();
        console.log("🔍 Checking Match collection...\n");

        // Get all matches
        const allMatches = await Match.find({});
        console.log(`📊 Total matches in database: ${allMatches.length}\n`);

        // Group by type
        const userMatches = allMatches.filter(m => m.matchedType === "USER");
        const projectMatches = allMatches.filter(m => m.matchedType === "PROJECT");

        console.log(`👥 Developer matches (USER): ${userMatches.length}`);
        console.log(`📁 Project matches (PROJECT): ${projectMatches.length}\n`);

        // Show sample developer matches
        if (userMatches.length > 0) {
            console.log("Sample Developer Matches:");
            userMatches.slice(0, 3).forEach((match, i) => {
                console.log(`\n${i + 1}. Match ID: ${match._id}`);
                console.log(`   User ID: ${match.userId}`);
                console.log(`   Matched User ID: ${match.matchedUserId}`);
                console.log(`   Source Project ID: ${match.sourceProjectId || "N/A"}`);
                console.log(`   Match %: ${match.matchPercentage || match.score}`);
                console.log(`   Has AI Reasoning: ${!!match.aiReasoning}`);
            });
        } else {
            console.log("⚠️ No developer matches found in database!");
            console.log("   This means the background RAG process hasn't created any user matches yet.");
        }

        // Show sample project matches
        if (projectMatches.length > 0) {
            console.log("\n\nSample Project Matches:");
            projectMatches.slice(0, 3).forEach((match, i) => {
                console.log(`\n${i + 1}. Match ID: ${match._id}`);
                console.log(`   User ID: ${match.userId}`);
                console.log(`   Matched Project ID: ${match.matchedProjectId}`);
                console.log(`   Match %: ${match.matchPercentage || match.score}`);
                console.log(`   Has AI Reasoning: ${!!match.aiReasoning}`);
            });
        }

        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
}

debugMatches();
