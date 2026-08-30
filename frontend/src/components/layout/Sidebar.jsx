import { NavLink } from "react-router-dom";
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
  return (
    <aside className="fixed inset-y-0 left-0 flex w-64 flex-col border-r border-gray-200 bg-white">
      <div className="flex h-16 items-center border-b border-gray-200 px-6">
        <h1 className="text-xl font-bold text-gray-900">
          CKKC
        </h1>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-gray-900 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;