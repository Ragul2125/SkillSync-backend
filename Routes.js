import { Router } from "express";
import authRouter from "./Routers/authRouter.js";
import profileRouter from "./Routers/profileRouter.js"
import projectRouter from './Routers/projectRouter.js'
import dashboardRouter from "./Routers/dashboardRouter.js"
import chatRoutes from './Routers/chatRoutes.js'
import matchRouter from "./Routers/matchRouter.js";
const router = Router();

router.use("/auth", authRouter);
router.use("/",profileRouter)
router.use("/",projectRouter)
router.use("/",matchRouter)
router.use("/",chatRoutes)
router.use("/",dashboardRouter)

export default router;
