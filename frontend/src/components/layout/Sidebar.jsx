import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaBox,
  FaTags,
  FaShoppingCart,
  FaTruck,
  FaWarehouse,
  FaUsers,
  FaBuilding,
  FaFileInvoice,
  FaFileAlt,
  FaMoneyBillWave,
  FaCalculator,
  FaChartBar,
  FaUserCog,
  FaUserShield,
  FaCog,
  FaChevronDown,
} from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";
import { hasPermission } from "../../utils/permissions";
import dashboardService from "../../services/dashboardService";

const navigation = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: FaTachometerAlt,
    module: "dashboard",
  },
  {
    label: "Products",
    path: "/products",
    icon: FaBox,
    module: "products",
  },
  {
    label: "Categories",
    path: "/categories",
    icon: FaTags,
    module: "categories",
  },
  {
    label: "Sales",
    path: "/sales",
    icon: FaShoppingCart,
    module: "sales",
  },
  {
    label: "Purchases",
    path: "/purchases",
    icon: FaTruck,
    module: "purchases",
  },
  {
    label: "Inventory",
    path: "/inventory",
    icon: FaWarehouse,
    module: "inventory",
  },
  {
    label: "Customers",
    path: "/customers",
    icon: FaUsers,
    module: "customers",
  },
  {
    label: "Suppliers",
    path: "/suppliers",
    icon: FaBuilding,
    module: "suppliers",
  },
  {
    label: "Quotations",
    path: "/quotations",
    icon: FaFileAlt,
    module: "quotations",
  },
  {
    label: "Invoices",
    path: "/invoices",
    icon: FaFileInvoice,
    module: "invoices",
  },
  {
    label: "Payments",
    path: "/payments",
    icon: FaMoneyBillWave,
    module: "payments",
  },
  {
    label: "Accounting",
    path: "/accounting",
    icon: FaCalculator,
    module: "accounting",
    children: [
      {
        label: "Dashboard",
        path: "/accounting",
      },
      {
        label: "Chart of Accounts",
        path: "/accounting/chart-of-accounts",
      },
      {
        label: "Journal Entries",
        path: "/accounting/journal-entries",
      },
      {
        label: "General Ledger",
        path: "/accounting/general-ledger",
      },
      {
        label: "Trial Balance",
        path: "/accounting/trial-balance",
      },
    ],
  },
  {
    label: "Reports",
    path: "/reports",
    icon: FaChartBar,
    module: "reports",
  },
  {
    label: "Users",
    path: "/users",
    icon: FaUserCog,
    module: "users",
  },
  {
    label: "Roles & Permissions",
    path: "/roles-permissions",
    icon: FaUserShield,
    module: "rolesPermissions",
  },
  {
    label: "Settings",
    path: "/settings",
    icon: FaCog,
    module: "settings",
  },
];

function Sidebar() {
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();

  const [openMenus, setOpenMenus] = useState({
    Accounting: location.pathname.startsWith("/accounting"),
  });

  const [todaySummary, setTodaySummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  const toggleMenu = (label) => {
    setOpenMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  useEffect(() => {
    if (!user?.role) return;

    const loadTodaySummary = async () => {
      try {
        setSummaryLoading(true);

        const response =
          await dashboardService.getTodaySummary();

        setTodaySummary(response.summary || null);
      } catch (error) {
        console.error(
          "Failed to load today's summary:",
          error
        );
        setTodaySummary(null);
      } finally {
        setSummaryLoading(false);
      }
    };

    loadTodaySummary();
  }, [user?.role]);

  if (authLoading) {
    return null;
  }

  const filteredNavigation = navigation.filter((item) => {
    return hasPermission(
      user?.role,
      item.module,
      "view"
    );
  });

  const formatCurrency = (value) => {
    return `₱${Number(value || 0).toLocaleString(
      "en-PH",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  const getSummaryItems = () => {
    if (!todaySummary) return [];

    if (
      user?.role === "owner" ||
      user?.role === "admin"
    ) {
      return [
        {
          label: "Sales",
          value: formatCurrency(todaySummary.sales),
        },
        {
          label: "Released Orders",
          value: todaySummary.orders || 0,
        },
        {
          label: "Profit",
          value: formatCurrency(todaySummary.profit),
        },
        {
          label: "Low Stock Products",
          value: todaySummary.lowStock || 0,
        },
      ];
    }

    if (user?.role === "sales") {
      return [
        {
          label: "Sales",
          value: formatCurrency(todaySummary.sales),
        },
        {
          label: "Orders",
          value: todaySummary.orders || 0,
        },
        {
          label: "Quotations",
          value: todaySummary.quotations || 0,
        },
      ];
    }

    if (user?.role === "purchasing") {
      return [
        {
          label: "Purchases",
          value: formatCurrency(todaySummary.purchases),
        },
        {
          label: "Pending POs",
          value: todaySummary.pendingPOs || 0,
        },
        {
          label: "Low Stock",
          value: todaySummary.lowStock || 0,
        },
      ];
    }

    if (user?.role === "accounting") {
      return [
        {
          label: "Sales",
          value: formatCurrency(todaySummary.sales),
        },
        {
          label: "Payments",
          value: formatCurrency(todaySummary.payments),
        },
        {
          label: "Receivables",
          value: formatCurrency(
            todaySummary.receivables
          ),
        },
      ];
    }

    return [];
  };

  const summaryItems = getSummaryItems();

  return (
    <aside className="fixed inset-y-0 left-0 flex w-64 flex-col border-r border-green-800 bg-gradient-to-b from-green-700 to-emerald-800">
      {/* Brand */}
      <div className="flex h-16 items-center border-b border-white/10 px-6">
        <h1 className="text-xl font-bold text-white">
          CKKC
        </h1>
      </div>

      {/* Navigation */}
      <nav className="space-y-0.5 overflow-y-auto p-3">
        {filteredNavigation.map((item) => {
          const Icon = item.icon;

          const hasChildren =
            item.children &&
            item.children.length > 0;

          // =========================
          // Parent Menu
          // =========================
          if (hasChildren) {
            const isParentActive =
              location.pathname.startsWith(item.path);

            const isOpen =
              openMenus[item.label];

            return (
              <div key={item.path}>
                <button
                  type="button"
                  onClick={() =>
                    toggleMenu(item.label)
                  }
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isParentActive
                      ? "bg-white/10 text-white"
                      : "text-green-50 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />

                  <span className="flex-1 text-left">
                    {item.label}
                  </span>

                  <FaChevronDown
                    className={`h-3 w-3 transition-transform ${
                      isOpen
                        ? "rotate-180"
                        : ""
                    }`}
                  />
                </button>

                {/* Submenu */}
                {isOpen && (
                  <div className="ml-4 mt-1 space-y-0.5 border-l border-white/20 pl-3">
                    {item.children.map(
                      (child) => (
                        <NavLink
                          key={child.path}
                          to={child.path}
                          end={
                            child.path ===
                            "/accounting"
                          }
                          className={({
                            isActive,
                          }) =>
                            `block rounded-lg px-3 py-2 text-sm transition ${
                              isActive
                                ? "bg-white text-green-700 shadow-sm"
                                : "text-green-100 hover:bg-white/10 hover:text-white"
                            }`
                          }
                        >
                          {child.label}
                        </NavLink>
                      )
                    )}
                  </div>
                )}
              </div>
            );
          }

          // =========================
          // Normal Menu
          // =========================
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-white text-green-700 shadow-sm"
                    : "text-green-50 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />

              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Today's Summary */}
      {summaryItems.length > 0 && (
        <div className="px-4 pb-3">
          <div className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
            <h3 className="text-sm font-semibold text-white">
              Today's Summary
            </h3>

            <div className="mt-3 space-y-2">
              {summaryLoading ? (
                <>
                  <div className="h-4 animate-pulse rounded bg-white/10" />
                  <div className="h-4 animate-pulse rounded bg-white/10" />
                  <div className="h-4 animate-pulse rounded bg-white/10" />
                </>
              ) : (
                summaryItems.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-green-100">
                      {item.label}
                    </span>

                    <span className="font-semibold text-white">
                      {item.value}
                    </span>
                  </div>
                ))
              )}
            </div>

            {(user?.role === "owner" ||
              user?.role === "admin") && (
              <NavLink
                to="/reports"
                className="mt-4 inline-block text-xs font-medium text-green-100 transition hover:text-white"
              >
                View Full Report →
              </NavLink>
            )}
          </div>
        </div>
      )}

      {/* Developer Credit */}
      <div className="mt-auto px-4 pb-3 text-left">
        <p className="text-[10px] text-green-200">
          Developer:
        </p>

        <p className="text-[11px] font-semibold tracking-wide text-white">
          JDVR
        </p>
      </div>
    </aside>
  );
}

export default Sidebar;