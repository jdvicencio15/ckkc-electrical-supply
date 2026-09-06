import { useState } from "react";
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

const navigation = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: FaTachometerAlt,
  },
  {
    label: "Products",
    path: "/products",
    icon: FaBox,
  },
  {
    label: "Categories",
    path: "/categories",
    icon: FaTags,
  },
  {
    label: "Sales",
    path: "/sales",
    icon: FaShoppingCart,
  },
  {
    label: "Purchases",
    path: "/purchases",
    icon: FaTruck,
  },
  {
    label: "Inventory",
    path: "/inventory",
    icon: FaWarehouse,
  },
  {
    label: "Customers",
    path: "/customers",
    icon: FaUsers,
  },
  {
    label: "Suppliers",
    path: "/suppliers",
    icon: FaBuilding,
  },
  {
    label: "Quotations",
    path: "/quotations",
    icon: FaFileAlt,
  },
  {
    label: "Invoices",
    path: "/invoices",
    icon: FaFileInvoice,
  },
  {
    label: "Payments",
    path: "/payments",
    icon: FaMoneyBillWave,
  },
  {
    label: "Accounting",
    path: "/accounting",
    icon: FaCalculator,
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
  },
  {
    label: "Users",
    path: "/users",
    icon: FaUserCog,
  },
  {
    label: "Roles & Permissions",
    path: "/roles-permissions",
    icon: FaUserShield,
  },
  {
    label: "Settings",
    path: "/settings",
    icon: FaCog,
  },
];

function Sidebar() {
  const location = useLocation();

  const [openMenus, setOpenMenus] = useState({
    Accounting: location.pathname.startsWith("/accounting"),
  });

  const toggleMenu = (label) => {
    setOpenMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

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
        {navigation.map((item) => {
          const Icon = item.icon;
          const hasChildren =
            item.children && item.children.length > 0;

          // =========================
          // Parent Menu
          // =========================
          if (hasChildren) {
            const isParentActive =
              location.pathname.startsWith(item.path);

            const isOpen = openMenus[item.label];

            return (
              <div key={item.path}>
                <button
                  type="button"
                  onClick={() => toggleMenu(item.label)}
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
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* =========================
                    Submenu
                ========================= */}
                {isOpen && (
                  <div className="ml-4 mt-1 space-y-0.5 border-l border-white/20 pl-3">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        end={child.path === "/accounting"}
                        className={({ isActive }) =>
                          `block rounded-lg px-3 py-2 text-sm transition ${
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
      <div className="px-4 pb-3">
        <div className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
          <h3 className="text-sm font-semibold text-white">
            Today's Summary
          </h3>

          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-green-100">
                Sales
              </span>

              <span className="font-semibold text-white">
                ₱0.00
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-green-100">
                Orders
              </span>

              <span className="font-semibold text-white">
                0
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-green-100">
                Profit
              </span>

              <span className="font-semibold text-white">
                ₱0.00
              </span>
            </div>
          </div>

          <button
            type="button"
            className="mt-4 text-xs font-medium text-green-100 transition hover:text-white"
          >
            View Full Report →
          </button>
        </div>
      </div>

      {/* Developer Credit */}
      <div className="mt-auto px-4 pb-3 text-left">
        <p className="text-[10px] text-green-200">
          Developed by:
        </p>

        <p className="text-[11px] font-semibold tracking-wide text-white">
          JDVR
        </p>
      </div>
    </aside>
  );
}

export default Sidebar;