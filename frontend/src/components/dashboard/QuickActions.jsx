import { Link } from "react-router-dom";
import {
  FaShoppingCart,
  FaBox,
  FaTruck,
  FaUserPlus,
  FaFileAlt,
  FaMoneyBillWave,
  FaCalculator,
  FaWarehouse,
  FaBuilding,
  FaFileInvoice,
} from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";

const actionsByRole = {
  owner: [
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
      label: "Quotations",
      path: "/quotations",
      icon: FaFileAlt,
    },
    {
      label: "Customers",
      path: "/customers",
      icon: FaUserPlus,
    },
  ],

  admin: [
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
      label: "Quotations",
      path: "/quotations",
      icon: FaFileAlt,
    },
    {
      label: "Customers",
      path: "/customers",
      icon: FaUserPlus,
    },
  ],

  sales: [
    {
      label: "Sales",
      path: "/sales",
      icon: FaShoppingCart,
    },
    {
      label: "Quotations",
      path: "/quotations",
      icon: FaFileAlt,
    },
    {
      label: "Customers",
      path: "/customers",
      icon: FaUserPlus,
    },
    {
      label: "Invoices",
      path: "/invoices",
      icon: FaFileInvoice,
    },
  ],

  purchasing: [
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
      label: "Suppliers",
      path: "/suppliers",
      icon: FaBuilding,
    },
    {
      label: "Products",
      path: "/products",
      icon: FaBox,
    },
  ],

  accounting: [
    {
      label: "Payments",
      path: "/payments",
      icon: FaMoneyBillWave,
    },
    {
      label: "Chart of Accounts",
      path: "/accounting/chart-of-accounts",
      icon: FaCalculator,
    },
    {
      label: "General Ledger",
      path: "/accounting/general-ledger",
      icon: FaCalculator,
    },
    {
      label: "Trial Balance",
      path: "/accounting/trial-balance",
      icon: FaCalculator,
    },
  ],
};

function QuickActions() {
  const { user } = useAuth();

  const actions = actionsByRole[user?.role] || [];

  if (actions.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Quick Actions
        </h2>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Common business actions
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={`${action.label}-${action.path}`}
              to={action.path}
              className="flex items-center gap-3 rounded-lg border border-green-100 bg-green-50 p-4 transition hover:border-green-200 hover:bg-green-100 dark:border-green-900/50 dark:bg-green-950/30 dark:hover:border-green-800 dark:hover:bg-green-900/40"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/50">
                <Icon className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>

              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {action.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default QuickActions;