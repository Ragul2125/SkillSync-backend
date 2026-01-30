import { Router } from "express";
import {createProject,getOngoingProjects,editStatus} from "../controllers/projectController.js";
import authenticate  from "../middlewares/authenticate.js";
const router = Router();

router.post("/createproject", authenticate, createProject);
router.get("/projects", authenticate, getOngoingProjects);
router.put("/status/:projectId", authenticate, editStatus);



export default router;
