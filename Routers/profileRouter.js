import { Router } from "express";
import { completeProfile, getProfile } from "../controllers/profileController.js";
import authenticate from "../middlewares/authenticate.js"
const router = Router(); // 👈 create router instance

router.put("/completeprofile", authenticate,completeProfile);
router.get("/profile/:userId",authenticate,getProfile)

export default router;
