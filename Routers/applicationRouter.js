import { Router } from "express";
import {
    applyToProject,
    getMyApplications,
    getProjectApplications,
    updateApplicationStatus,
} from "../controllers/applicationController.js";
import authenticate from "../middlewares/authenticate.js";

const router = Router();

// Apply to a project
router.post("/apply", authenticate, applyToProject);

// Get user's applications
router.get("/my-applications", authenticate, getMyApplications);

// Get applications for a project (project owner only)
router.get("/project/:projectId", authenticate, getProjectApplications);

// Update application status (project owner only)
router.patch("/:id/status", authenticate, updateApplicationStatus);

export default router;
