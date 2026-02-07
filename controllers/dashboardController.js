import Project from "../model/projectModel.js";
import asyncHandler from "../utils/asyncHandler.js";
import Match from "../model/matchModel.js";
import User from "../model/userModel.js";

export const getStatisticsData = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [activeProjects, completedProjects, newMatches] = await Promise.all([
    Project.countDocuments({ createdById: userId, status: "active" }),
    Project.countDocuments({ createdById: userId, status: "completed" }),
    Match.countDocuments({ userId, status: "pending" }),
  ]);

  const teamMembersAgg = await Project.aggregate([
    { $match: { createdById: userId } },
    { $unwind: "$teamMembers" },
    { $group: { _id: "$teamMembers" } },
    { $count: "totalTeamMembers" },
  ]);

  const teamMembers = teamMembersAgg[0]?.totalTeamMembers || 0;

  res.status(200).json({
    activeProjects,
    completedProjects,
    newMatches,
    teamMembers,
  });
});

export const getMyProjects = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  const projects = await Project.find({ createdById: userId }).limit(3);

  res.status(200).json({
    projects,
  });
});

export const getAiMatchedDevsForDashboard = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  console.log(`🔍 Dashboard: Fetching developer matches for user: ${userId}`);

  const dev = await Match.find({
    userId,
    matchedType: "USER",
  })
    .populate("matchedUserId", "_id name title bio skills")
    .populate("sourceProjectId", "name description techStack status") // Show which project they're matched for
    .sort({ matchPercentage: -1, createdAt: -1 })
    .limit(3) // Sort by match percentage first

  console.log(`📊 Dashboard: Found ${dev.length} developer matches`);

  if (!dev.length) {
    return res.status(200).json({
      success: true,
      message: "No AI matched developers found. Complete your profile to get matches.",
      dev: [],
    });
  }

  res.status(200).json({
    success: true,
    count: dev.length,
    dev,
  });
});

export const getAiMatchedProjectsForDashboard = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  const projects = await Match.find({
    userId,
    matchedType: "PROJECT",
  })
    .populate("matchedProjectId", "name description techStack")
    .sort({ matchPercentage: -1, createdAt: -1 })
    .limit(3);

  if (!projects.length) {
    return res.status(200).json({
      success: true,
      message: "No AI matched projects found. Complete your profile to get matches.",
      projects: [],
    });
  }

  res.status(200).json({
    success: true,
    count: projects.length,
    projects,
  });
});

export const getMyDevs = asyncHandler(async (req, res, next) => {
  const userId = req.user?._id;

  if (!userId) {
    const error = new Error("Unauthorized. Please login again.");
    error.statusCode = 401;
    return next(error);
  }

  const projects = await Project.find({ createdById: userId })
    .select("name teamMembers")
    .populate({
      path: "teamMembers.user",
      select: "name email",
    });

  if (!projects.length) {
    return res.status(200).json({
      success: true,
      message: "No projects found",
      data: [],
    });
  }

  const result = projects.map((project) => ({
    projectId: project._id,
    projectName: project.name,
    developers: project.teamMembers.map((member) => ({
      userId: member.user._id,
      name: member.user.name,
      email: member.user.email,
      role: member.role,
    })),
  }));

  res.status(200).json({
    success: true,
    count: result.length,
    data: result,
  });
});
