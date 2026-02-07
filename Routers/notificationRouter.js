import { Router } from "express";
import {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
} from "../controllers/notificationController.js";
import authenticate from "../middlewares/authenticate.js";

const router = Router();

// Get unread count (must be before /:id routes)
router.get("/unread-count", authenticate, getUnreadCount);

// Get user's notifications
router.get("/", authenticate, getNotifications);

// Mark notification as read
router.patch("/:id/read", authenticate, markAsRead);

// Mark all notifications as read
router.patch("/read-all", authenticate, markAllAsRead);

export default router;
