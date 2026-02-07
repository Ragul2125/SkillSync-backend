import { Router } from "express";
import { computeMatchesForUser } from "../services/ragService.js";
import asyncHandler from "../utils/asyncHandler.js";
import authenticate from "../middlewares/authenticate.js";

const router = Router();

/**
 * Manually refresh matches for the current user
 * Triggers background RAG computation
 */
router.post("/refresh", authenticate, asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // Trigger background computation (non-blocking)
    setImmediate(() => {
        computeMatchesForUser(userId.toString()).catch(err =>
            console.error("Manual match refresh error:", err)
        );
    });

    res.status(200).json({
        success: true,
        message: "Match refresh initiated. Results will be available shortly.",
    });
}));

export default router;
