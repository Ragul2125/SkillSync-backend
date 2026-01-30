import { Router } from "express";
import { getAiMatchedDev, getAiMatchedProjects, getMyDevs, getMyProjects, getStatisticsData } from "../controllers/dashboardController.js";
import authenticate from "../middlewares/authenticate.js";

const router = Router();

router.get("/statistics", authenticate,getStatisticsData);
router.get("/projects", authenticate,getMyProjects);
router.get("/matcheddev", authenticate,getAiMatchedDev)
router.get("/matchedproject", authenticate,getAiMatchedProjects)
router.get("/developers",authenticate,getMyDevs)


export default router;
