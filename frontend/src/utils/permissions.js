const permissions = {
  "admin-owner": {
    dashboard: "full",

    // Inventory / Master Data
    products: "full",
    units: "full",
    categories: "full",

    // Sales
    sales: "full",
    quotations: "full",
    clientPO: "full",
    invoices: "full",
    payments: "full",

    // Purchasing
    purchases: "full",
    supplierPricing: "full",
    supplierPO: "full",

    // Inventory
    inventory: "full",

    // Master Data
    customers: "full",
    suppliers: "full",

    // Accounting / Reports
    accounting: "full",
    reports: "full",

    // Administration
    users: "full",
    rolesPermissions: "full",
    settings: "full",
    auditTrails: "full",
  },

  sales: {
    dashboard: "view",

    // Inventory / Master Data
    products: "view",
    units: "view",
    categories: "view",

    // Sales
    sales: "full",
    quotations: "full",
    clientPO: "full",
    invoices: "full",
    payments: "none",

    // Purchasing
    purchases: "none",
    supplierPricing: "view",
    supplierPO: "none",

    // Inventory
    inventory: "view",

    // Master Data
    customers: "full",
    suppliers: "none",

    // Accounting / Reports
    accounting: "none",
    reports: "none",

    // Administration
    users: "none",
    rolesPermissions: "none",
    settings: "none",
    auditTrails: "none",
  },

  purchasing: {
  dashboard: "view",

  // Inventory / Master Data
  products: "full",
  units: "view",
  categories: "view",

  // Sales
  sales: "none",
  quotations: "none",
  clientPO: "none",
  invoices: "none",
  payments: "none",

  // Purchasing
  purchases: "full",
  supplierPricing: "full",
  supplierPO: "full",

  // Inventory
  inventory: "full",

  // Master Data
  customers: "none",
  suppliers: "full",

  // Accounting / Reports
  accounting: "none",
  reports: "none",

  // Administration
  users: "none",
  rolesPermissions: "none",
  settings: "none",
  auditTrails: "none",
},

  accounting: {
    dashboard: "view",

    // Inventory / Master Data
    products: "none",
    units: "none",
    categories: "none",

    // Sales
    sales: "view",
    quotations: "none",
    clientPO: "view",
    invoices: "full",
    payments: "full",

    // Purchasing
    purchases: "view",
    supplierPricing: "view",
    supplierPO: "view",

    // Inventory
    inventory: "view",

    // Master Data
    customers: "view",
    suppliers: "view",

    // Accounting / Reports
    accounting: "full",
    reports: "full",

    // Administration
    users: "none",
    rolesPermissions: "none",
    settings: "none",
    auditTrails: "none",
  },
};

export const getPermissionGroup = (role) => {
  if (role === "owner" || role === "admin") {
    return "admin-owner";
  }

  return role;
};

export const hasPermission = (
  role,
  module,
  action = "view"
) => {
  const group = getPermissionGroup(role);

  const permission =
    permissions[group]?.[module];

  if (!permission || permission === "none") {
    return false;
  }

  if (permission === "full") {
    return true;
  }

  return permission === action;
};

export default permissions;