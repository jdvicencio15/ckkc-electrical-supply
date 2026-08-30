import { useState } from "react";

import {
  FaMoneyBillWave,
  FaShoppingCart,
  FaChartLine,
  FaBox,
} from "react-icons/fa";

import { useAuth } from "../context/AuthContext";
import StatCard from "../components/dashboard/StatCard";
import SalesOverview from "../components/dashboard/SalesOverview";
import LowStockAlerts from "../components/dashboard/LowStockAlerts";
import SalesByCategory from "../components/dashboard/SalesByCategory";
import RecentTransactions from "../components/dashboard/RecentTransactions";
import QuickActions from "../components/dashboard/QuickActions";

function Dashboard() {
  const { user } = useAuth();

  const [selectedMonth, setSelectedMonth] = useState("2026-08");

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Overview of your business performance.
          </p>
        </div>

        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:focus:border-green-500"
        >
          <option value="2026-08">August 2026</option>
          <option value="2026-07">July 2026</option>
          <option value="2026-06">June 2026</option>
          <option value="2026-05">May 2026</option>
        </select>
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
      </div>

      {/* Quick Actions */}
      <QuickActions />
    </div>
  );
}

export default Dashboard;