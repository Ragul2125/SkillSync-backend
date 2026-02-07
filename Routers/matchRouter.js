import { Router } from "express";
import { getAiMatchedDev, getAiMatchedProjects, connectDev } from "../controllers/matchedController.js";
import { getAiMatchedDevsWithReasoning, getAiMatchedProjectsWithReasoning } from "../controllers/aiMatchController.js";
import authenticate from "../middlewares/authenticate.js"
const router = Router(); // 👈 create router instance

router.get("/ai-matched-devs", authenticate, getAiMatchedDev);
router.get("/ai-matched-projects", authenticate, getAiMatchedProjects);
router.get("/connectdeveloper", authenticate, connectDev);

// New AI-powered matching routes with reasoning
router.get("/ai-matches/developers", authenticate, getAiMatchedDevsWithReasoning);
router.get("/ai-matches/projects", authenticate, getAiMatchedProjectsWithReasoning);

export default router;
