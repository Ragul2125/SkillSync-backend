import Match from "../model/matchModel.js";
import Project from "../model/projectModel.js";
import Application from "../model/applicationModel.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getAiMatchedDev = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  if (!userId) {
    return next(new AppError("Unauthorized. Please login again.", 401));
  }

  const dev = await Match.find({
    userId,
    matchedType: "USER",
  })
    .populate("matchedUserId", "name title bio skills")
    .populate("sourceProjectId", "name description techStack status") // Show which project they're matched for
    .sort({ matchPercentage: -1, createdAt: -1 }); // Sort by match percentage first

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

export const getAiMatchedProjects = asyncHandler(async (req, res, next) => {
  const userId = req.user?._id;

  if (!userId) {
    const error = new Error("Unauthorized. Please login again.");
    error.statusCode = 401;
    return next(error);
  }

  const projects = await Match.find({
    userId,
    matchedType: "PROJECT",
  })
    .populate("matchedProjectId", "name description techStack")
    .sort({ matchPercentage: -1, createdAt: -1 });

  console.log(projects);

  if (!projects.length) {
    return res.status(200).json({
      success: true,
      message: "No AI matched projects found. Complete your profile to get matches.",
      projects: [],
    });
  }

  const projectIds = projects.map(p => p.matchedProjectId?._id).filter(Boolean);
  const applications = await Application.find({
    applicantId: userId,
    projectId: { $in: projectIds }
  }).select('projectId status');

  // Create a map of projectId -> application status
  const applicationMap = {};
  applications.forEach(app => {
    applicationMap[app.projectId.toString()] = app.status;
  });

  const projectsWithStatus = projects.map(match => {
    const projectId = match.matchedProjectId?._id?.toString();
    return {
      ...match.toObject(),
      hasApplied: !!applicationMap[projectId],
      applicationStatus: applicationMap[projectId] || null
    };
  });

  res.status(200).json({
    success: true,
    count: projectsWithStatus.length,
    projects: projectsWithStatus,
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

