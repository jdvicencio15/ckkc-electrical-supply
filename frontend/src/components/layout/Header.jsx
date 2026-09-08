import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import GlobalSearch from "./GlobalSearch";
import toast from "react-hot-toast";

import notificationService from "../../services/notificationService";

import {
  FaSun,
  FaMoon,
  FaBell,
  FaExclamationTriangle,
  FaFileInvoice,
  FaShoppingCart,
  FaFileAlt,
  FaMoneyBillWave,
  FaCog,
  FaUserCog,
  FaHeadset,
  FaSignOutAlt,
} from "react-icons/fa";

const notificationIcons = {
  low_stock: FaExclamationTriangle,
  sale: FaShoppingCart,
  purchase: FaShoppingCart,
  quotation: FaFileAlt,
  invoice: FaFileInvoice,
  payment: FaMoneyBillWave,
  system: FaCog,
};

const getNotificationIcon = (type) => {
  return notificationIcons[type] || FaBell;
};

const formatNotificationTime = (date) => {
  if (!date) return "";

  const createdAt = new Date(date);
  const now = new Date();

  const diffInSeconds = Math.floor(
    (now.getTime() - createdAt.getTime()) / 1000
  );

  if (diffInSeconds < 60) {
    return "Just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);

  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${
      diffInMinutes === 1 ? "" : "s"
    } ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);

  if (diffInHours < 24) {
    return `${diffInHours} hour${
      diffInHours === 1 ? "" : "s"
    } ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInDays < 7) {
    return `${diffInDays} day${
      diffInDays === 1 ? "" : "s"
    } ago`;
  }

  return createdAt.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const roleLabels = {
  owner: "Owner",
  admin: "Admin",
  sales: "Sales",
  purchasing: "Purchasing",
  accounting: "Accounting",
};


function Header() {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  /*
   * Fetch notifications
   */
  const fetchNotifications = async () => {
    try {
      setNotificationsLoading(true);

      const data = await notificationService.getNotifications();

      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setNotificationsLoading(false);
    }
  };

  /*
   * Load notifications when Header mounts.
   */
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const formattedDate = currentDateTime.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const formattedTime = currentDateTime.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleProfileSettings = () => {
    setShowProfile(false);
    navigate("/profile-settings");
  };

  const handleContactSupport = () => {
    setShowProfile(false);
    navigate("/contact-support");
  };

  /*
   * Open notification.
   *
   * If unread:
   *   mark as read
   *
   * If notification has a link:
   *   navigate to that module.
   */
const handleNotificationClick = async (notification) => {
  try {
    if (!notification.isRead) {
      await notificationService.markAsRead(notification._id);

      setNotifications((current) =>
        current.map((item) =>
          item._id === notification._id
            ? { ...item, isRead: true }
            : item
        )
      );

      setUnreadCount((current) => Math.max(0, current - 1));
    }

    setShowNotifications(false);

    if (notification.link) {
      navigate(notification.link);
    }
  } catch (error) {
    console.error("Failed to mark notification as read:", error);

    toast.error("Failed to update notification");
  }
};

  /*
   * Mark all notifications as read.
   */
  const handleMarkAllRead = async () => {
    if (unreadCount === 0) {
      return;
    }

    try {
      await notificationService.markAllAsRead();

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );

      setUnreadCount(0);

      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);

      toast.error("Failed to update notifications");
    }
  };

  return (
    <header className="flex min-h-16 items-center justify-between border-b border-slate-200 bg-white px-6 dark:border-slate-800 dark:bg-slate-900">
      {/* Left: Date & Time */}
      <div className="hidden shrink-0 text-xs font-medium text-slate-500 lg:block dark:text-slate-400">
        {formattedDate} • {formattedTime}
      </div>

      {/* Header Actions */}
      <div className="flex shrink-0 items-center gap-3">
        {/* Search */}
        <GlobalSearch />

        {/* Notifications */}
        <div className="relative">
         <button
  type="button"
  onClick={() => {
    const nextState = !showNotifications;

    setShowNotifications(nextState);
    setShowProfile(false);

    if (nextState) {
      fetchNotifications();
    }
  }}
  className="relative flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
  aria-label="Notifications"
>
  <FaBell className="h-4 w-4" />

  {unreadCount > 0 && (
    <span className="absolute right-1.5 top-1.5 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold leading-none text-white ring-2 ring-white dark:ring-slate-900">
      {unreadCount > 99 ? "99+" : unreadCount}
    </span>
  )}
</button>

          {showNotifications && (
            <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
              {/* Notification Header */}
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Notifications
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {unreadCount} unread notification
                    {unreadCount === 1 ? "" : "s"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  disabled={unreadCount === 0}
                  className="text-xs font-medium text-slate-600 transition hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-400 dark:hover:text-white"
                >
                  Mark all read
                </button>
              </div>

              {/* Notification List */}
              <div className="max-h-96 overflow-y-auto">
                {notificationsLoading ? (
                  <div className="px-4 py-8 text-center">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Loading notifications...
                    </p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                      <FaBell className="h-4 w-4 text-slate-400" />
                    </div>

                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      No notifications
                    </p>

                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      You're all caught up.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {notifications.map((notification) => {
                      const Icon = getNotificationIcon(
                        notification.type
                      );

                      return (
                        <button
                          key={notification._id}
                          type="button"
                          onClick={() =>
                            handleNotificationClick(notification)
                          }
                          className={`flex w-full gap-3 px-4 py-4 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800 ${
                            !notification.isRead
                              ? "bg-green-50/50 dark:bg-green-950/10"
                              : ""
                          }`}
                        >
                          {/* Icon */}
                          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-50 dark:bg-green-950/40">
                            <Icon className="h-4 w-4 text-green-600 dark:text-green-400" />

                            {!notification.isRead && (
                              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-green-500 ring-2 ring-white dark:ring-slate-900" />
                            )}
                          </div>

                          {/* Content */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <p
                                className={`text-sm ${
                                  notification.isRead
                                    ? "font-medium"
                                    : "font-semibold"
                                } text-slate-900 dark:text-slate-100`}
                              >
                                {notification.title}
                              </p>
                            </div>

                            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                              {notification.message}
                            </p>

                            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                              {formatNotificationTime(
                                notification.createdAt
                              )}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-slate-200 p-3 text-center dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowNotifications(false);
                    navigate("/notifications");
                  }}
                  className="text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                >
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          aria-label={
            darkMode
              ? "Switch to light mode"
              : "Switch to dark mode"
          }
        >
          {darkMode ? (
            <FaSun className="h-4 w-4 text-amber-400" />
          ) : (
            <FaMoon className="h-4 w-4" />
          )}
        </button>

        {/* User */}
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
           {roleLabels[user?.role] || "Admin"}
          </p>
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowProfile((current) => !current);
              setShowNotifications(false);
            }}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white transition hover:ring-2 hover:ring-green-500 hover:ring-offset-2 dark:bg-green-600 dark:hover:ring-offset-slate-900"
            aria-label="Open profile menu"
          >
            {user?.firstName?.charAt(0)?.toUpperCase() || "U"}
          </button>

          {showProfile && (
            <div className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
              {/* Profile Header */}
              <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-700">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {user?.firstName || "Admin"}{" "}
                  {user?.lastName || ""}
                </p>

                <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                  {user?.email || "Account"}
                </p>
              </div>

              {/* Profile Actions */}
              <div className="p-2">
                {/* Profile Settings */}
                <button
                  type="button"
                  onClick={handleProfileSettings}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <FaUserCog className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  Profile Settings
                </button>

                {/* Contact Support */}
                <button
                  type="button"
                  onClick={handleContactSupport}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white"
                >
                  <FaHeadset className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  Contact Support
                </button>
              </div>

              {/* Logout */}
              <div className="border-t border-slate-200 p-2 dark:border-slate-700">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                >
                  <FaSignOutAlt className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;