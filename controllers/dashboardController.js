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

export const getAiMatchedDev = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  const dev_3 = await Match.find({
    userId,
    matchedProjectId: { $exists: false },
  })
    .sort({ createdAt: -1 })
    .limit(3);

  const dev = await Match.find({
    userId,
    matchedProjectId: { $exists: false },
  })
    .sort({ createdAt: -1 })
    .limit(3);

  res.status(200).json({
    dev_3,
    dev,
  });
});

export const getAiMatchedProjects = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  const projects = await Match.find({
    userId,
    matchedUserId: { $exists: false },
  })
    .sort({ createdAt: -1 })
    .limit(3);

  res.status(200).json({
    projects,
  });
});

export const getMyDevs = asyncHandler(async (req, res, next) => {
  const userId = req.user?._id;

  if (!userId) {
    return next(new AppError("Unauthorized. Please login again.", 401));
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
