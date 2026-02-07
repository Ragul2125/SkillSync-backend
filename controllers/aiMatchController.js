import User from "../model/userModel.js";
import Project from "../model/projectModel.js";
import asyncHandler from "../utils/asyncHandler.js";
import { searchSimilarDocuments } from "../backend_rag_utils/vectorSearch.js";
import { generateMatchReasoning } from "../backend_rag_utils/matchReasoning.js";

/**
 * Get AI-matched developers with reasoning
 * Uses vector search to find similar developers and Gemini to generate match reasoning
 */
export const getAiMatchedDevsWithReasoning = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        return next(error);
    }

    if (!user.description_embedding || user.description_embedding.length === 0) {
        const error = new Error("Please complete your profile first to get AI matches");
        error.statusCode = 400;
        return next(error);
    }

    const similarDevelopers = await searchSimilarDocuments(
        User,
        user.description_embedding,
        10
    );

    const filteredDevelopers = similarDevelopers.filter(
        (dev) => dev._id.toString() !== userId.toString()
    );

    if (filteredDevelopers.length === 0) {
        return res.status(200).json({
            success: true,
            message: "No matching developers found",
            matches: [],
        });
    }

    const ragResponse = await generateMatchReasoning(user, filteredDevelopers);

    res.status(200).json({
        success: true,
        count: filteredDevelopers.length,
        developers: filteredDevelopers,
        aiReasoning: ragResponse,
    });
});

/**
 * Get AI-matched projects with reasoning
 * Uses vector search to find similar projects and Gemini to generate match reasoning
 */
export const getAiMatchedProjectsWithReasoning = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        return next(error);
    }

    if (!user.description_embedding || user.description_embedding.length === 0) {
        const error = new Error("Please complete your profile first to get AI matches");
        error.statusCode = 400;
        return next(error);
    }

    const similarProjects = await searchSimilarDocuments(
        Project,
        user.description_embedding,
        10
    );

    const filteredProjects = similarProjects.filter(
        (project) => project.createdById?.toString() !== userId.toString()
    );

    if (filteredProjects.length === 0) {
        return res.status(200).json({
            success: true,
            message: "No matching projects found",
            matches: [],
        });
    }

    const ragResponse = await generateMatchReasoning(user, filteredProjects);

    res.status(200).json({
        success: true,
        count: filteredProjects.length,
        projects: filteredProjects,
        aiReasoning: ragResponse,
    });
});
