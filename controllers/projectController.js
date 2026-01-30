import Project from "../model/projectModel.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createProject = asyncHandler(async (req, res, next) => {
  const { name, description } = req.body;
  const createrId = req.user._id;

  if (!name || !description) {
    const error = new Error("Name and description are required");
    error.statusCode = 400;
    return next(error);
  }

  const existing = await Project.findOne({ name, createdById: createrId });

  if (existing) {
    const error = new Error("You already have a project with this name");
    error.statusCode = 409;
    return next(error);
  }

  const project = await Project.create({
    ...req.body,
    createdById: createrId,
    status: req.body.status || "planned",
  });

  res.status(201).json({
    message: "Project created successfully",
    project,
  });
});

export const getOngoingProjects = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  const [projects,ongoingProjects, completedProjects, newProjects] = await Promise.all([
    Project.find({ createdById: userId}),
    Project.find({ createdById: userId, status: "active" }),
    Project.find({ createdById: userId, status: "completed" }),
    Project.find({ createdById: userId, status: "planned" }),
  ]);

  res.status(200).json({
    message: "Projects fetched successfully",
    projects ,
    ongoingProjects,
    completedProjects,
    newProjects,
  });
});

export const editStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  const { projectId } = req.params;
  const userId = req.user._id;

  const updatedProject = await Project.findOneAndUpdate(
    { _id: projectId, createdById: userId }, // security check
    { status },
    { new: true, runValidators: true },
  );

  if (!updatedProject) {
    const error = new Error("Project not found or unauthorized");
    error.statusCode = 404;
    return next(error);
  }

  res.status(200).json({
    message: "Project status updated successfully",
    project: updatedProject,
  });
});
