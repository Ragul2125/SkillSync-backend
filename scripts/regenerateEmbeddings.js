import Project from "../model/projectModel.js";
import User from "../model/userModel.js";
import { generateEmbedding } from "../backend_rag_utils/embeddings.js";
import connectDb from "../config/db.js";
import dotenv from "dotenv";

dotenv.config();

/**
 * Regenerate embeddings for all existing projects and users
 * Run this script once to fix old data that doesn't have embeddings
 */
async function regenerateEmbeddings() {
    try {
        await connectDb();
        console.log("🔄 Starting embedding regeneration...\n");

        // Regenerate project embeddings
        const projects = await Project.find({});
        console.log(`📊 Found ${projects.length} projects`);

        let projectsUpdated = 0;
        for (const project of projects) {
            if (!project.description_embedding || project.description_embedding.length === 0) {
                console.log(`🔧 Generating embedding for project: ${project.name}`);

                const techStack = project.techStack || [];
                const textToEmbed = `${project.name} ${project.description} ${Array.isArray(techStack) ? techStack.join(" ") : techStack}`;
                const embedding = await generateEmbedding(textToEmbed);

                project.description_embedding = embedding;
                await project.save();
                projectsUpdated++;

                // Small delay to avoid rate limits
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
        console.log(`✅ Updated ${projectsUpdated} projects with embeddings\n`);

        // Regenerate user embeddings
        const users = await User.find({ title: { $exists: true } }); // Only users with completed profiles
        console.log(`📊 Found ${users.length} users with profiles`);

        let usersUpdated = 0;
        for (const user of users) {
            if (!user.description_embedding || user.description_embedding.length === 0) {
                console.log(`🔧 Generating embedding for user: ${user.name}`);

                const textToEmbed = `${user.title || ""} ${user.bio || ""} ${Array.isArray(user.skills) ? user.skills.join(" ") : user.skills || ""} ${user.experience || 0} years experience`;
                const embedding = await generateEmbedding(textToEmbed);

                user.description_embedding = embedding;
                await user.save();
                usersUpdated++;

                // Small delay to avoid rate limits
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
        console.log(`✅ Updated ${usersUpdated} users with embeddings\n`);

        console.log("🎉 Embedding regeneration complete!");
        console.log(`   Projects: ${projectsUpdated}/${projects.length}`);
        console.log(`   Users: ${usersUpdated}/${users.length}`);

        process.exit(0);
    } catch (error) {
        console.error("❌ Error regenerating embeddings:", error);
        process.exit(1);
    }
}

regenerateEmbeddings();
