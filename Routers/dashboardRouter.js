import { Router } from "express";
import { getAiMatchedDevsForDashboard, getAiMatchedProjectsForDashboard, getMyDevs, getMyProjects, getStatisticsData } from "../controllers/dashboardController.js";
import authenticate from "../middlewares/authenticate.js";

const router = Router();

router.get("/statistics", authenticate, getStatisticsData);
router.get("/projects", authenticate, getMyProjects);
router.get("/matcheddev", authenticate, getAiMatchedDevsForDashboard)
router.get("/matchedproject", authenticate, getAiMatchedProjectsForDashboard)
router.get("/developers", authenticate, getMyDevs)


export default router;
