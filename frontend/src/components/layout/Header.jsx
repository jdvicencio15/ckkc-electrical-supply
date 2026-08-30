import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import {
  FaSearch,
  FaSun,
  FaMoon,
  FaBell,
  FaExclamationTriangle,
  FaFileInvoice,
  FaShoppingCart,
} from "react-icons/fa";

const notifications = [
  {
    id: 1,
    title: "Low Stock",
    message: "Electrical Wire — 3 units left",
    time: "5 minutes ago",
    icon: FaExclamationTriangle,
  },
  {
    id: 2,
    title: "Pending Payment",
    message: "Invoice #INV-1008 needs attention",
    time: "20 minutes ago",
    icon: FaFileInvoice,
  },
  {
    id: 3,
    title: "New Sale",
    message: "Sale #SALE-1024 was created",
    time: "1 hour ago",
    icon: FaShoppingCart,
  },
];

function Header() {
  const { user } = useAuth();
  const { darkMode, toggleTheme } = useTheme();

  const [showNotifications, setShowNotifications] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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

  return (
    <header className="flex min-h-16 items-center justify-between border-b border-slate-200 bg-white px-6 dark:border-slate-800 dark:bg-slate-900">
      {/* Left: Date & Time */}
      <div className="hidden shrink-0 text-xs font-medium text-slate-500 lg:block dark:text-slate-400">
        {formattedDate} • {formattedTime}
      </div>

      {/* Header Actions */}
      <div className="flex shrink-0 items-center gap-3">
        {/* Search */}
        <div className="relative w-96">
          <FaSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            type="search"
            placeholder="Search products, invoices, customers..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-green-500 dark:focus:bg-slate-800"
          />
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setShowNotifications((current) => !current)
            }
            className="relative flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Notifications"
          >
            <FaBell className="h-4 w-4" />

            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 z-50 w-80 rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Notifications
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    3 unread notifications
                  </p>
                </div>

                <button
                  type="button"
                  className="text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  Mark all read
                </button>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.map((notification) => {
                  const Icon = notification.icon;

                  return (
                    <div
                      key={notification.id}
                      className="flex gap-3 px-4 py-4 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-50 dark:bg-green-950/40">
                        <Icon className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {notification.title}
                        </p>

                        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                          {notification.message}
                        </p>

                        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                          {notification.time}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-slate-200 p-3 text-center dark:border-slate-700">
                <button
                  type="button"
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
            {user?.role || "Admin"}
          </p>
        </div>

        {/* Avatar */}
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white dark:bg-green-600">
          {user?.firstName?.charAt(0)?.toUpperCase() || "U"}
        </div>
      </div>
    </header>
  );
}

export default Header;