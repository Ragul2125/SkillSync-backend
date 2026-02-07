import Notification from "../model/notificationModel.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getNotifications = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    const { unreadOnly } = req.query;

    const query = { userId };
    if (unreadOnly === "true") {
        query.isRead = false;
    }

    const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(50); // Limit to last 50 notifications

    const unreadCount = await Notification.countDocuments({
        userId,
        isRead: false,
    });

    res.status(200).json({
        success: true,
        count: notifications.length,
        unreadCount,
        notifications,
    });
});

export const getUnreadCount = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;

    const unreadCount = await Notification.countDocuments({
        userId,
        isRead: false,
    });

    res.status(200).json({
        success: true,
        unreadCount,
    });
});

export const markAsRead = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOne({ _id: id, userId });

    if (!notification) {
        const error = new Error("Notification not found");
        error.statusCode = 404;
        return next(error);
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
        success: true,
        message: "Notification marked as read",
        notification,
    });
});

export const markAllAsRead = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;

    const result = await Notification.updateMany(
        { userId, isRead: false },
        { isRead: true }
    );

    res.status(200).json({
        success: true,
        message: "All notifications marked as read",
        updatedCount: result.modifiedCount,
    });
});
