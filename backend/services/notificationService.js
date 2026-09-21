const Notification = require("../models/Notification");
const User = require("../models/User");
const mongoose = require("mongoose");

const createNotification = async ({
  userId,
  type,
  title,
  message,
  link = null,
  entityType = null,
  entityId = null,
}) => {
  if (!userId) {
    throw new Error("Notification userId is required");
  }

  const user = await User.findById(userId).select("_id");

  if (!user) {
    throw new Error("Notification user not found");
  }

  return Notification.create({
    userId,
    type,
    title,
    message,
    link,
    entityType,
    entityId,
  });
};

const createNotificationsForRoles = async ({
  roles,
  type,
  title,
  message,
  link = null,
  entityType = null,
  entityId = null,
  excludeUserId = null,
}) => {
  if (!Array.isArray(roles) || roles.length === 0) {
    throw new Error("Notification roles are required");
  }

  const query = {
    role: { $in: roles },
    isActive: true,
  };

  // Don't notify the user who triggered the event.
  if (excludeUserId) {
    query._id = { $ne: excludeUserId };
  }

  const users = await User.find(query).select("_id");

  if (users.length === 0) {
    return [];
  }

  const notifications = users.map((user) => ({
    userId: user._id,
    type,
    title,
    message,
    link,
    entityType,
    entityId,
  }));

  return Notification.insertMany(notifications);
};

module.exports = {
  createNotification,
  createNotificationsForRoles,
};