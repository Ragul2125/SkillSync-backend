import { login, signup } from "../controllers/authController.js";
import { Router } from "express";

const router = Router(); // 👈 create router instance

router.post("/signup", signup);
router.post("/login", login);

export default router;
