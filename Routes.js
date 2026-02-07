import { Router } from "express";
import authRouter from "./Routers/authRouter.js";
import profileRouter from "./Routers/profileRouter.js"
import projectRouter from './Routers/projectRouter.js'
import dashboardRouter from "./Routers/dashboardRouter.js"
import chatRoutes from './Routers/chatRoutes.js'
import matchRouter from "./Routers/matchRouter.js";
import refreshRouter from "./Routers/refreshRouter.js";
import applicationRouter from "./Routers/applicationRouter.js";
import notificationRouter from "./Routers/notificationRouter.js";
const router = Router();

router.use("/auth", authRouter);
router.use("/", profileRouter)
router.use("/", projectRouter)
router.use("/", matchRouter)
router.use("/", chatRoutes)
router.use("/", dashboardRouter)
router.use("/matches", refreshRouter)
router.use("/applications", applicationRouter)
router.use("/notifications", notificationRouter)

export default router;
