import { Link } from "react-router-dom";
import {
  FaShoppingCart,
  FaBox,
  FaTruck,
  FaUserPlus,
} from "react-icons/fa";

const actions = [
  {
    label: "New Sale",
    path: "/sales/new",
    icon: FaShoppingCart,
  },
  {
    label: "Add Product",
    path: "/products/new",
    icon: FaBox,
  },
  {
    label: "New Purchase",
    path: "/purchases/new",
    icon: FaTruck,
  },
  {
    label: "Add Customer",
    path: "/customers/new",
    icon: FaUserPlus,
  },
];

function QuickActions() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-gray-900">
          Quick Actions
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Common business actions
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.path}
              to={action.path}
              className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 transition hover:border-gray-300 hover:bg-gray-50"
            >
              <div className="rounded-lg bg-gray-100 p-3">
                <Icon className="h-5 w-5 text-gray-700" />
              </div>

              <span className="text-sm font-medium text-gray-800">
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