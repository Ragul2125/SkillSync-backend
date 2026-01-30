import Match from "../model/matchModel.js";
import Project from "../model/projectModel.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getAiMatchedDev = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  
  if (!userId) {
    return next(new AppError("Unauthorized. Please login again.", 401));
  }

  const dev = await Match.find({
    userId,
    $or: [{ matchedProjectId: { $exists: false } }, { matchedProjectId: null }],
  }).populate("matchedUserId","name title bio skills").sort({ createdAt: -1 });

  if (!dev.length) {
    return res.status(200).json({
      success: true,
      message: "No AI matched developers found",
      dev: [],
    });
  }

  res.status(200).json({
    success: true,
    count: dev.length,
    dev,
  });
});

export const getAiMatchedProjects = asyncHandler(async (req, res, next) => {
  const userId = req.user?._id;

  if (!userId) {
    return next(new AppError("Unauthorized. Please login again.", 401));
  }

  const projects = await Match.find({
    userId,
    $or: [{ matchedUserId: { $exists: false } }, { matchedUserId: null }],
  }).populate("matchedProjectId","name description techStack").sort({ createdAt: -1 });

  if (!projects.length) {
    return res.status(200).json({
      success: true,
      message: "No AI matched projects found",
      projects: [],
    });
  }

  res.status(200).json({
    success: true,
    count: projects.length,
    projects,
  });
});

export const connectDev = asyncHandler(async (req, res, next) => {
  const { matchedDevID } = req.params;
  const { role } = req.body;
  const ownerId = req.user?._id;

  if (!ownerId) {
    return next(new AppError("Unauthorized", 401));
  }

  const matched = await Match.findById(matchedDevID);

  if (!matched) {
    return next(new AppError("Match not found", 404));
  }

  if (!matched.sourceProjectId || !matched.matchedUserId) {
    return next(new AppError("Invalid match record", 400));
  }

  matched.status = "accepted";
  await matched.save();

  const project = await Project.findById(matched.sourceProjectId);

  if (!project) {
    return next(new AppError("Project not found", 404));
  }

  project.teamMembers.push({
    user: matched.matchedUserId,
    role: role || "Developer",
  });

  await project.save();

  res.status(200).json({
    success: true,
    message: "Developer connected to project successfully",
  });
});

