const express = require("express");

const router = express.Router();

const {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} = require("../controllers/notificationController");

const protect = require("../middleware/authMiddleware");

// All notification routes require authentication
router.use(protect);

// GET ALL NOTIFICATIONS
router.get("/", getNotifications);

// MARK ALL AS READ
router.patch("/read-all", markAllNotificationsAsRead);

// MARK ONE AS READ
router.patch("/:id/read", markNotificationAsRead);

// DELETE
router.delete("/:id", deleteNotification);

module.exports = router;