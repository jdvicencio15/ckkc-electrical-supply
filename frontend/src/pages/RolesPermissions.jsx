import {
  FaCheck,
  FaTimes,
  FaShieldAlt,
  FaUserTie,
  FaShoppingCart,
  FaCalculator,
} from "react-icons/fa";

import permissions, {
} from "../utils/permissions";

const roleConfig = [
  {
    group: "admin-owner",
    label: "Admin / Owner",
    badge: "Full Access",
    description:
      "Complete access to all system modules, business operations, and system settings.",
    icon: FaShieldAlt,
    badgeClass:
      "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400",
  },
  {
    group: "sales",
    label: "Sales",
    badge: "Sales Access",
    description:
      "Access to sales operations, customers, quotations, invoices, and related business information.",
    icon: FaShoppingCart,
    badgeClass:
      "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  },
  {
    group: "purchasing",
    label: "Purchasing",
    badge: "Purchasing Access",
    description:
      "Access to purchasing, inventory, products, categories, and supplier operations.",
    icon: FaUserTie,
    badgeClass:
      "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400",
  },
  {
    group: "accounting",
    label: "Accounting",
    badge: "Accounting Access",
    description:
      "Access to financial records, sales information, invoices, payments, accounting, and reports.",
    icon: FaCalculator,
    badgeClass:
      "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400",
  },
];

const moduleLabels = {
  dashboard: "Dashboard",
  products: "Products",
  categories: "Categories",
  sales: "Sales",
  purchases: "Purchases",
  inventory: "Inventory",
  customers: "Customers",
  suppliers: "Suppliers",
  quotations: "Quotations",
  invoices: "Invoices",
  payments: "Payments",
  accounting: "Accounting",
  reports: "Reports",
  users: "Users",
  rolesPermissions: "Roles & Permissions",
  settings: "System Settings",
};

const moduleOrder = [
  "dashboard",
  "products",
  "categories",
  "sales",
  "purchases",
  "inventory",
  "customers",
  "suppliers",
  "quotations",
  "invoices",
  "payments",
  "accounting",
  "reports",
  "users",
  "rolesPermissions",
  "settings",
];

const formatPermission = (permission) => {
  if (permission === "full") {
    return {
      label: "Full Access",
      className:
        "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400",
      icon: FaCheck,
    };
  }

  if (permission === "view") {
    return {
      label: "View Only",
      className:
        "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
      icon: FaCheck,
    };
  }

  return {
    label: "No Access",
    className:
      "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500",
    icon: FaTimes,
  };
};

const getPermissionSummary = (group) => {
  const rolePermissions = permissions[group] || {};

  const accessibleModules = moduleOrder.filter(
    (module) =>
      rolePermissions[module] &&
      rolePermissions[module] !== "none"
  );

  if (group === "admin-owner") {
    return "All permissions enabled";
  }

  return accessibleModules
    .map((module) => moduleLabels[module])
    .join(", ");
};

function RolesPermissions() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Roles & Permissions
        </h1>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Review user roles and system access permissions.
        </p>
      </div>

      {/* Role Cards */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {roleConfig.map((role) => {
          const Icon = role.icon;

          return (
            <div
              key={role.group}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400">
                  <Icon className="h-5 w-5" />
                </div>

                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${role.badgeClass}`}
                >
                  {role.badge}
                </span>
              </div>

              <h2 className="mt-4 font-semibold text-slate-900 dark:text-slate-100">
                {role.label}
              </h2>

              <p className="mt-2 min-h-[60px] text-sm leading-5 text-slate-500 dark:text-slate-400">
                {role.description}
              </p>

              <div className="mt-5 border-t border-slate-200 pt-4 dark:border-slate-800">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Permissions
                </p>

                <p className="mt-2 text-sm leading-5 text-slate-600 dark:text-slate-300">
                  {getPermissionSummary(role.group)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Permission Overview */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Permission Overview
          </h2>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Current system access by role. Permissions are controlled by the system RBAC configuration.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
              <tr>
                <th className="sticky left-0 bg-slate-50 px-6 py-3 font-semibold dark:bg-slate-800">
                  Module
                </th>

                {roleConfig.map((role) => (
                  <th
                    key={role.group}
                    className="px-6 py-3 font-semibold"
                  >
                    {role.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {moduleOrder.map((module) => (
                <tr
                  key={module}
                  className="border-t border-slate-100 dark:border-slate-800"
                >
                  <td className="sticky left-0 bg-white px-6 py-4 font-medium text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                    {moduleLabels[module]}
                  </td>

                  {roleConfig.map((role) => {
                    const permission =
                      permissions[role.group]?.[module] ||
                      "none";

                    const config =
                      formatPermission(permission);

                    const Icon = config.icon;

                    return (
                      <td
                        key={`${role.group}-${module}`}
                        className="px-6 py-4"
                      >
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${config.className}`}
                        >
                          <Icon className="text-[10px]" />

                          {config.label}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="border-t border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400">
                <FaCheck className="text-[9px]" />
              </span>

              Full Access
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                <FaCheck className="text-[9px]" />
              </span>

              View Only
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                <FaTimes className="text-[9px]" />
              </span>

              No Access
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RolesPermissions;