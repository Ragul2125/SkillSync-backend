import Application from "../model/applicationModel.js";
import Notification from "../model/notificationModel.js";
import Project from "../model/projectModel.js";
import Match from "../model/matchModel.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * Apply to a project
 * POST /api/applications/apply
 */
export const applyToProject = asyncHandler(async (req, res, next) => {
    const { projectId, name, email, message } = req.body;
    const applicantId = req.user._id;

    // Validate required fields
    if (!projectId || !name || !email || !message) {
        const error = new Error("All fields are required: projectId, name, email, message");
        error.statusCode = 400;
        return next(error);
    }

    // Get project details
    const project = await Project.findById(projectId);
    if (!project) {
        const error = new Error("Project not found");
        error.statusCode = 404;
        return next(error);
    }

    // Check if user is trying to apply to their own project
    if (project.createdById.toString() === applicantId.toString()) {
        const error = new Error("You cannot apply to your own project");
        error.statusCode = 400;
        return next(error);
    }

    // Check if user has already applied
    const existingApplication = await Application.findOne({
        applicantId,
        projectId,
    });

    if (existingApplication) {
        const error = new Error("You have already applied to this project");
        error.statusCode = 409;
        return next(error);
    }

    // Create application
    const application = await Application.create({
        applicantId,
        projectId,
        projectOwnerId: project.createdById,
        name,
        email,
        message,
    });

    // Create notification for project owner
    await Notification.create({
        userId: project.createdById,
        type: "application",
        title: "New Application",
        message: `${name} applied to your project "${project.name}"`,
        relatedId: application._id,
        relatedModel: "Application",
    });

    res.status(201).json({
        success: true,
        message: "Application submitted successfully",
        application,
    });
});

/**
 * Get user's applications
 * GET /api/applications/my-applications
 */
export const getMyApplications = asyncHandler(async (req, res, next) => {
    const applicantId = req.user._id;

    const applications = await Application.find({ applicantId })
        .populate("projectId", "name description techStack status")
        .populate("projectOwnerId", "name email")
        .sort({ appliedAt: -1 });

    res.status(200).json({
        success: true,
        count: applications.length,
        applications,
    });
});

/**
 * Get applications for a project (project owner only)
 * GET /api/applications/project/:projectId
 */
export const getProjectApplications = asyncHandler(async (req, res, next) => {
    const { projectId } = req.params;
    const userId = req.user._id;

    // Verify project ownership
    const project = await Project.findById(projectId);
    if (!project) {
        const error = new Error("Project not found");
        error.statusCode = 404;
        return next(error);
    }

    if (project.createdById.toString() !== userId.toString()) {
        const error = new Error("You are not authorized to view applications for this project");
        error.statusCode = 403;
        return next(error);
    }

    const applications = await Application.find({ projectId })
        .populate("applicantId", "name email title bio skills")
        .sort({ appliedAt: -1 });

    res.status(200).json({
        success: true,
        count: applications.length,
        applications,
    });
});

/**
 * Update application status (project owner only)
 * PATCH /api/applications/:id/status
 */
export const updateApplicationStatus = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { status, role } = req.body;
    const userId = req.user._id;

    // Validate status
    if (!["accepted", "rejected"].includes(status)) {
        const error = new Error("Invalid status. Must be 'accepted' or 'rejected'");
        error.statusCode = 400;
        return next(error);
    }

    // Get application with project details
    const application = await Application.findById(id).populate("projectId", "name teamMembers");
    if (!application) {
        const error = new Error("Application not found");
        error.statusCode = 404;
        return next(error);
    }

    // Verify project ownership
    if (application.projectOwnerId.toString() !== userId.toString()) {
        const error = new Error("You are not authorized to update this application");
        error.statusCode = 403;
        return next(error);
    }

    // Update application
    application.status = status;
    application.respondedAt = new Date();
    await application.save();

    // If accepted, add developer to project team
    if (status === "accepted") {
        console.log(`🔍 Application accepted, adding developer to team...`);
        console.log(`📋 Application ID: ${application._id}`);
        console.log(`👤 Applicant ID: ${application.applicantId}`);
        console.log(`📁 Project ID: ${application.projectId._id}`);

        const project = await Project.findById(application.projectId);

        if (!project) {
            const error = new Error("Project not found");
            error.statusCode = 404;
            return next(error);
        }


        // Check if user is already in team
        const alreadyInTeam = project.teamMembers.some(
            member => member.user.toString() === application.applicantId.toString()
        );


        if (!alreadyInTeam) {
            project.teamMembers.push({
                user: application.applicantId,
                role: role || "Developer",
            });
            await project.save();
        }

        // Update related Match status if exists
        const matchUpdateResult = await Match.updateMany(
            {
                userId: application.projectOwnerId,
                matchedUserId: application.applicantId,
                sourceProjectId: application.projectId,
                matchedType: "USER"
            },
            {
                status: "accepted"
            }
        );
    }

    // Create notification for applicant
    await Notification.create({
        userId: application.applicantId,
        type: "application_response",
        title: `Application ${status === "accepted" ? "Accepted" : "Rejected"}`,
        message: `Your application to "${application.projectId.name}" has been ${status}`,
        relatedId: application._id,
        relatedModel: "Application",
    });

    res.status(200).json({
        success: true,
        message: `Application ${status} successfully${status === "accepted" ? " and developer added to team" : ""}`,
        application,
    });
});
