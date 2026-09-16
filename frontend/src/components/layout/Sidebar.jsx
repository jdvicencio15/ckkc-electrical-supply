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
  FaRuler,
  FaCoins,
  FaReceipt,
  FaClipboardList,
} from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";
import { useSettings } from "../../context/SettingsContext";
import { hasPermission } from "../../utils/permissions";
import dashboardService from "../../services/dashboardService";
import { formatCurrency } from "../../utils/currency";

const navigation = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: FaTachometerAlt,
    module: "dashboard",
  },

  // =========================
  // SALES
  // =========================
  {
    label: "Sales",
    path: "/sales",
    icon: FaShoppingCart,
    module: "sales",
    children: [
      {
        label: "Quotations",
        path: "/quotations",
        module: "quotations",
      },
      {
        label: "Client POs",
        path: "/client-pos",
        module: "clientPO",
      },
      {
        label: "Sales",
        path: "/sales",
        module: "sales",
      },
      {
        label: "Invoices",
        path: "/invoices",
        module: "invoices",
      },
      {
        label: "Payments",
        path: "/payments",
        module: "payments",
      },
    ],
  },

  // =========================
  // PURCHASING
  // =========================
  {
    label: "Purchasing",
    path: "/purchases",
    icon: FaTruck,
    module: "purchases",
    children: [
      {
        label: "Supplier Pricing",
        path: "/supplier-pricing",
        module: "supplierPricing",
      },
      {
        label: "Supplier POs",
        path: "/supplier-pos",
        module: "supplierPO",
      },
      {
        label: "Purchases",
        path: "/purchases",
        module: "purchases",
      },
    ],
  },

  // =========================
  // INVENTORY
  // =========================
  {
    label: "Inventory",
    path: "/inventory",
    icon: FaWarehouse,
    module: "inventory",
    children: [
      {
        label: "Products",
        path: "/products",
        module: "products",
      },
      {
        label: "Categories",
        path: "/categories",
        module: "categories",
      },
      {
        label: "Units",
        path: "/units",
        module: "units",
      },
      {
        label: "Inventory",
        path: "/inventory",
        module: "inventory",
      },
    ],
  },

  // =========================
  // MASTER DATA
  // =========================
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

  // =========================
  // ACCOUNTING
  // =========================
  {
    label: "Accounting",
    path: "/accounting",
    icon: FaCalculator,
    module: "accounting",
    children: [
      {
        label: "Dashboard",
        path: "/accounting",
        module: "accounting",
      },
      {
        label: "Chart of Accounts",
        path: "/accounting/chart-of-accounts",
        module: "accounting",
      },
      {
        label: "Journal Entries",
        path: "/accounting/journal-entries",
        module: "accounting",
      },
      {
        label: "General Ledger",
        path: "/accounting/general-ledger",
        module: "accounting",
      },
      {
        label: "Trial Balance",
        path: "/accounting/trial-balance",
        module: "accounting",
      },
      {
        label: "Expenses",
        path: "/accounting/expenses",
        module: "accounting",
      },
    ],
  },

  // =========================
  // REPORTS
  // =========================
  {
    label: "Reports",
    path: "/reports",
    icon: FaChartBar,
    module: "reports",
  },

  // =========================
  // ADMINISTRATION
  // =========================
  {
    label: "Administration",
    path: "/admin",
    icon: FaUserCog,
    module: "administration",
    children: [
      {
        label: "Users",
        path: "/users",
        module: "users",
      },
      {
        label: "Roles & Permissions",
        path: "/roles-permissions",
        module: "rolesPermissions",
      },
      {
        label: "Audit Trails",
        path: "/audit-trails",
        module: "auditTrails",
      },
      {
        label: "Settings",
        path: "/settings",
        module: "settings",
      },
    ],
  },
];

function Sidebar() {
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const { settings, systemName } = useSettings();
  const logoUrl = settings?.appearance?.logo?.url;

  const [openMenus, setOpenMenus] = useState({
  Sales:
    location.pathname.startsWith("/quotations") ||
    location.pathname.startsWith("/client-pos") ||
    location.pathname.startsWith("/sales") ||
    location.pathname.startsWith("/invoices") ||
    location.pathname.startsWith("/payments"),

  Purchasing:
    location.pathname.startsWith("/supplier-pricing") ||
    location.pathname.startsWith("/supplier-pos") ||
    location.pathname.startsWith("/purchases"),

  Inventory:
    location.pathname.startsWith("/products") ||
    location.pathname.startsWith("/categories") ||
    location.pathname.startsWith("/units") ||
    location.pathname.startsWith("/inventory"),

  Accounting: location.pathname.startsWith("/accounting"),

  Administration:
    location.pathname.startsWith("/users") ||
    location.pathname.startsWith("/roles-permissions") ||
    location.pathname.startsWith("/audit-trails") ||
    location.pathname.startsWith("/settings"),
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

        const response = await dashboardService.getTodaySummary();

        setTodaySummary(response.summary || null);
      } catch (error) {
        console.error("Failed to load today's summary:", error);
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

 const filteredNavigation = navigation
  .map((item) => {
    if (!item.children) {
      return hasPermission(user?.role, item.module, "view")
        ? item
        : null;
    }

    const allowedChildren = item.children.filter((child) =>
      hasPermission(user?.role, child.module, "view")
    );

    if (
      !hasPermission(user?.role, item.module, "view") &&
      allowedChildren.length === 0
    ) {
      return null;
    }

    return {
      ...item,
      children: allowedChildren,
    };
  })
  .filter(Boolean);

  const getSummaryItems = () => {
    if (!todaySummary) return [];

    if (user?.role === "owner" || user?.role === "admin") {
      return [
        {
          label: "Sales",
          value: formatCurrency(todaySummary.sales, settings?.currency),
        },
        {
          label: "Released Orders",
          value: todaySummary.orders || 0,
        },
        {
          label: "Profit",
          value: formatCurrency(todaySummary.profit, settings?.currency),
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
          value: formatCurrency(todaySummary.sales, settings?.currency),
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
          value: formatCurrency(todaySummary.purchases, settings?.currency),
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
          value: formatCurrency(todaySummary.sales, settings?.currency),
        },
        {
          label: "Payments",
          value: formatCurrency(todaySummary.payments, settings?.currency),
        },
        {
          label: "Receivables",
          value: formatCurrency(todaySummary.receivables, settings?.currency),
        },
      ];
    }

    return [];
  };

  const summaryItems = getSummaryItems();

  return (
    <aside className="fixed inset-y-0 left-0 flex w-64 flex-col border-r border-green-800 bg-gradient-to-b from-green-700 to-emerald-800">
   {/* Brand */}
<div className="flex h-20 items-center gap-4 border-b border-white/10 px-6">
  {logoUrl ? (
    <img
      src={logoUrl}
      alt={`${systemName} logo`}
      className="h-13 w-13 shrink-0 rounded-lg object-contain"
    />
  ) : (
    <div className="flex h-15 w-15 shrink-0 items-center justify-center rounded-lg border border-green-400/30 bg-green-500/15 text-lg font-bold text-green-400">
      {systemName?.charAt(0)?.toUpperCase() || "A"}
    </div>
  )}

  <h1 className="truncate text-5xl font-bold tracking-tight text-white">
    {systemName}
  </h1>
</div>

      {/* Navigation */}
      <nav className="space-y-0.5 overflow-y-auto p-2.5">
        {filteredNavigation.map((item) => {
          const Icon = item.icon;

          const hasChildren = item.children && item.children.length > 0;

          // =========================
          // Parent Menu
          // =========================
          if (hasChildren) {
            const isParentActive = item.children?.some((child) =>
  location.pathname.startsWith(child.path)
);

            const isOpen = openMenus[item.label];

            return (
              <div key={item.path}>
                <button
                  type="button"
                  onClick={() => toggleMenu(item.label)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    isParentActive
                      ? "bg-white/10 text-white"
                      : "text-green-50 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />

                  <span className="flex-1 text-left">{item.label}</span>

                  <FaChevronDown
                    className={`h-3 w-3 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Submenu */}
                {isOpen && (
                  <div className="ml-4 mt-1 space-y-0.5 border-l border-white/20 pl-3">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        end={child.path === "/accounting"}
                        className={({ isActive }) =>
                          `block rounded-lg px-3 py-1.5 text-sm transition ${
                            isActive
                              ? "bg-white text-green-700 shadow-sm"
                              : "text-green-100 hover:bg-white/10 hover:text-white"
                          }`
                        }
                      >
                        {child.label}
                      </NavLink>
                    ))}
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
                `flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
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
                    <span className="text-green-100">{item.label}</span>

                    <span className="font-semibold text-white">
                      {item.value}
                    </span>
                  </div>
                ))
              )}
            </div>

            {(user?.role === "owner" || user?.role === "admin") && (
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
        <p className="text-[10px] text-green-200">Developer:</p>

        <p className="text-[11px] font-semibold tracking-wide text-white">
          JDVR
        </p>
      </div>
    </aside>
  );
}

export default Sidebar;
