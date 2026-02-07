import User from "../model/userModel.js";
import Project from "../model/projectModel.js";
import Match from "../model/matchModel.js";
import { searchSimilarDocuments } from "../backend_rag_utils/vectorSearch.js";
import { generateMatchReasoning } from "../backend_rag_utils/matchReasoning.js";

/**
 * Compute and save AI-powered matches for a user
 * This runs in the background after profile updates
 */
export const computeMatchesForUser = async (userId) => {
    try {
        console.log(`🤖 Computing matches for user: ${userId}`);

        const user = await User.findById(userId);
        if (!user || !user.description_embedding || user.description_embedding.length === 0) {
            console.log(`⚠️ User ${userId} has no embedding, skipping match computation`);
            return;
        }

        // Find similar projects
        const similarProjects = await searchSimilarDocuments(Project, user.description_embedding, 10);
        const filteredProjects = similarProjects.filter(
            (project) => project.createdById?.toString() !== userId.toString()
        );

        // Get user's projects to match developers against
        const userProjects = await Project.find({ createdById: userId });
        console.log(`📊 User has ${userProjects.length} project(s)`);

        // Generate AI reasoning for developers matched to user's projects
        if (userProjects.length > 0) {
            let processedProjects = 0;

            for (let projectIndex = 0; projectIndex < userProjects.length; projectIndex++) {
                const project = userProjects[projectIndex];

                if (!project.description_embedding || project.description_embedding.length === 0) {
                    console.log(`⚠️ Skipping project "${project.name}" - no embedding found`);
                    continue; // Skip projects without embeddings
                }

                // Add delay between projects to avoid rate limits (except for first project)
                if (projectIndex > 0) {
                    await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
                }

                // Find developers who match this specific project
                const similarDevelopers = await searchSimilarDocuments(User, project.description_embedding, 5);
                const filteredDevelopers = similarDevelopers.filter(
                    (dev) => dev._id.toString() !== userId.toString()
                );

                if (filteredDevelopers.length > 0) {
                    try {
                        // Create a pseudo-user profile for the project
                        const projectAsUser = {
                            name: project.name,
                            skills: project.techStack || [],
                            bio: project.description,
                        };

                        const devReasoning = await generateMatchReasoning(projectAsUser, filteredDevelopers);

                        // Save developer matches for this specific project
                        for (let i = 0; i < filteredDevelopers.length; i++) {
                            const dev = filteredDevelopers[i];
                            const reasoning = devReasoning.matches?.[i];

                            await Match.findOneAndUpdate(
                                {
                                    userId: userId,
                                    matchedUserId: dev._id,
                                    sourceProjectId: project._id, // Link to specific project
                                    matchedType: "USER",
                                },
                                {
                                    userId: userId,
                                    matchedUserId: dev._id,
                                    sourceProjectId: project._id, // Which project they're matched for
                                    matchedType: "USER",
                                    score: dev.score ? Math.round(dev.score * 100) : reasoning?.matchPercentage || 75,
                                    matchPercentage: reasoning?.matchPercentage || 75,
                                    aiReasoning: reasoning?.reasoning || "Matched based on similar skills and experience",
                                    reason: reasoning?.reasoning || "Matched based on similar skills and experience",
                                    lastComputedAt: new Date(),
                                    status: "pending",
                                },
                                { upsert: true, new: true }
                            );
                        }
                        console.log(`✅ Saved ${filteredDevelopers.length} developer matches for project ${project.name}`);
                        processedProjects++;
                    } catch (error) {
                        console.error(`❌ Error generating developer reasoning for project ${project.name}:`, error.message);
                        // Continue with next project even if this one fails
                    }
                } else {
                    console.log(`⚠️ No matching developers found for project "${project.name}"`);
                }
            }

            if (processedProjects === 0) {
                console.log(`⚠️ No projects with embeddings were processed for developer matching`);
            }
        } else {
            console.log(`⚠️ User ${userId} has no projects, skipping developer matching`);
        }

        // Generate AI reasoning for projects
        if (filteredProjects.length > 0) {
            try {
                const projectReasoning = await generateMatchReasoning(user, filteredProjects);

                // Save project matches to database
                for (let i = 0; i < filteredProjects.length; i++) {
                    const project = filteredProjects[i];
                    const reasoning = projectReasoning.matches?.[i];

                    await Match.findOneAndUpdate(
                        {
                            userId: userId,
                            matchedProjectId: project._id,
                            matchedType: "PROJECT",
                        },
                        {
                            userId: userId,
                            matchedProjectId: project._id,
                            matchedType: "PROJECT",
                            score: project.score ? Math.round(project.score * 100) : reasoning?.matchPercentage || 75,
                            matchPercentage: reasoning?.matchPercentage || 75,
                            aiReasoning: reasoning?.reasoning || "Matched based on required skills",
                            reason: reasoning?.reasoning || "Matched based on required skills",
                            lastComputedAt: new Date(),
                            status: "pending",
                        },
                        { upsert: true, new: true }
                    );
                }
                console.log(`✅ Saved ${filteredProjects.length} project matches for user ${userId}`);
            } catch (error) {
                console.error(`❌ Error generating project reasoning:`, error.message);
            }
        }

        console.log(`🎉 Match computation completed for user ${userId}`);
    } catch (error) {
        console.error(`❌ Error computing matches for user ${userId}:`, error);
    }
};

/**
 * Compute matches for all users when a new project is created
 * Finds users who would be a good fit for this project
 */
export const computeMatchesForProject = async (projectId) => {
    try {
        console.log(`🤖 Computing user matches for project: ${projectId}`);

        const project = await Project.findById(projectId);
        if (!project || !project.description_embedding || project.description_embedding.length === 0) {
            console.log(`⚠️ Project ${projectId} has no embedding, skipping match computation`);
            return;
        }

        // Find similar users who might be interested in this project
        const similarUsers = await searchSimilarDocuments(User, project.description_embedding, 10);
        const filteredUsers = similarUsers.filter(
            (user) => user._id.toString() !== project.createdById?.toString()
        );

        if (filteredUsers.length > 0) {
            try {
                // Create a pseudo-user profile for the project to generate reasoning
                const projectAsUser = {
                    name: project.name,
                    skills: project.techStack || [],
                    bio: project.description,
                };

                const userReasoning = await generateMatchReasoning(projectAsUser, filteredUsers);

                // Save user matches for this project
                for (let i = 0; i < filteredUsers.length; i++) {
                    const user = filteredUsers[i];
                    const reasoning = userReasoning.matches?.[i];

                    await Match.findOneAndUpdate(
                        {
                            userId: user._id,
                            matchedProjectId: projectId,
                            sourceProjectId: projectId,
                            matchedType: "PROJECT",
                        },
                        {
                            userId: user._id,
                            matchedProjectId: projectId,
                            sourceProjectId: projectId,
                            matchedType: "PROJECT",
                            score: user.score ? Math.round(user.score * 100) : reasoning?.matchPercentage || 75,
                            matchPercentage: reasoning?.matchPercentage || 75,
                            aiReasoning: reasoning?.reasoning || "Your skills match this project's requirements",
                            reason: reasoning?.reasoning || "Your skills match this project's requirements",
                            lastComputedAt: new Date(),
                            status: "pending",
                        },
                        { upsert: true, new: true }
                    );
                }
                console.log(`✅ Saved ${filteredUsers.length} user matches for project ${projectId}`);
            } catch (error) {
                console.error(`❌ Error generating user reasoning for project:`, error.message);
            }
        }

        console.log(`🎉 Match computation completed for project ${projectId}`);
    } catch (error) {
        console.error(`❌ Error computing matches for project ${projectId}:`, error);
    }
};
