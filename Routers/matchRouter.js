import { Router } from "express";
import {getAiMatchedDev, getAiMatchedProjects, connectDev} from "../controllers/matchedController.js";
import authenticate from "../middlewares/authenticate.js"
const router = Router(); // 👈 create router instance

router.get("/ai-matched-devs", authenticate, getAiMatchedDev);
router.get("/ai-matched-projects", authenticate, getAiMatchedProjects);
router.get("/connectdeveloper", authenticate, connectDev);

export default router;
