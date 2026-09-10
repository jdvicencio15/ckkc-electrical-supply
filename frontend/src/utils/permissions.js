const permissions = {
  "admin-owner": {
    dashboard: "full",
    products: "full",
    units: "full",
    categories: "full",
    sales: "full",
    purchases: "full",
    inventory: "full",
    customers: "full",
    suppliers: "full",
    quotations: "full",
    invoices: "full",
    payments: "full",
    accounting: "full",
    reports: "full",
    users: "full",
    rolesPermissions: "full",
    settings: "full",
  },

 sales: {
  dashboard: "view",
   products: "view",
  units: "view",
  categories: "view",
  sales: "full",
  purchases: "none",
  inventory: "view",
  customers: "full",
  suppliers: "none",
  quotations: "full",
  invoices: "full",
  payments: "none",
  accounting: "none",
  reports: "none",
  users: "none",
  rolesPermissions: "none",
  settings: "none",
},

purchasing: {
  dashboard: "view",
  products: "full",
  units: "full",
  categories: "full",
  sales: "none",
  purchases: "full",
  inventory: "full",
  customers: "none",
  suppliers: "full",
  quotations: "none",
  invoices: "none",
  payments: "none",
  accounting: "none",
  reports: "none",
  users: "none",
  rolesPermissions: "none",
  settings: "none",
},

  accounting: {
    dashboard: "view",
    products: "none",
    units: "none",
    categories: "none",
    sales: "view",
    purchases: "view",
    inventory: "view",
    customers: "view",
    suppliers: "view",
    quotations: "none",
    invoices: "full",
    payments: "full",
    accounting: "full",
    reports: "full",
    users: "none",
    rolesPermissions: "none",
    settings: "none",
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