import {
  FaMoneyBillWave,
  FaShoppingCart,
  FaChartLine,
  FaBox,
} from "react-icons/fa";

import StatCard from "../components/dashboard/StatCard";
import SalesOverview from "../components/dashboard/SalesOverview";
import LowStockAlerts from "../components/dashboard/LowStockAlerts";
import SalesByCategory from "../components/dashboard/SalesByCategory";
import RecentTransactions from "../components/dashboard/RecentTransactions";
import QuickActions from "../components/dashboard/QuickActions";


function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Overview of your business performance.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Sales"
          value="₱0.00"
          icon={FaMoneyBillWave}
          description="This month"
        />

        <StatCard
          title="Total Orders"
          value="0"
          icon={FaShoppingCart}
          description="This month"
        />

        <StatCard
          title="Gross Profit"
          value="₱0.00"
          icon={FaChartLine}
          description="This month"
        />

        <StatCard
          title="Total Products"
          value="0"
          icon={FaBox}
          description="Currently active"
        />
      </div>

      {/* Sales Overview + Low Stock */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SalesOverview />
        </div>

        <LowStockAlerts />
      </div>

      {/* Sales by Category + Recent Transactions */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SalesByCategory />

        <RecentTransactions />
        <QuickActions />
        
      </div>
    </div>
  );
}

export default Dashboard;