import { useEffect, useState } from "react";

import dashboardService from "../../services/dashboardService";

import {
  FaMoneyBillWave,
  FaShoppingCart,
  FaChartLine,
  FaBox,
} from "react-icons/fa";

import StatCard from "./StatCard";
import SalesOverview from "./SalesOverview";
import LowStockAlerts from "./LowStockAlerts";
import SalesByCategory from "./SalesByCategory";
import RecentTransactions from "./RecentTransactions";
import QuickActions from "./QuickActions";

import { useSettings } from "../../context/SettingsContext";
import { formatCurrency } from "../../utils/currency";

function ManagementDashboard() {
  const { settings } = useSettings();

  const currentDate = new Date();

  const currentMonth = `${currentDate.getFullYear()}-${String(
    currentDate.getMonth() + 1,
  ).padStart(2, "0")}`;

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);

  const [dashboardSummary, setDashboardSummary] = useState({
    sales: 0,
    orders: 0,
    profit: 0,
  });

  const [salesByCategory, setSalesByCategory] = useState([]);
  const [salesOverview, setSalesOverview] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);

        const [
          summaryResponse,
          salesResponse,
          productResponse,
        ] = await Promise.all([
          dashboardService.getDashboardSummary(selectedMonth),
          dashboardService.getSales(),
          dashboardService.getProducts(),
        ]);

        setDashboardSummary(
          summaryResponse.summary || {
            sales: 0,
            orders: 0,
            profit: 0,
          },
        );

        setSalesByCategory(
          summaryResponse.salesByCategory || [],
        );

        setSalesOverview(
          summaryResponse.salesOverview || [],
        );

        setSales(salesResponse.sales || []);
        setProducts(productResponse.products || []);
      } catch (error) {
        console.error(
          "Failed to load management dashboard:",
          error,
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [selectedMonth]);

  const selectedSales = sales.filter((sale) => {
    if (!sale.saleDate) return false;

    return (
      sale.saleDate.startsWith(selectedMonth) &&
      sale.status === "released"
    );
  });

  const activeProducts = products.filter(
    (product) => product.status === "active",
  );

  const lowStockProducts = products.filter(
    (product) =>
      product.status === "active" &&
      product.currentStock <= product.minimumStock,
  );

  const monthOptions = Array.from(
    { length: 12 },
    (_, index) => {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - index,
        1,
      );

      const value = `${date.getFullYear()}-${String(
        date.getMonth() + 1,
      ).padStart(2, "0")}`;

      const label = date.toLocaleDateString(
        "en-US",
        {
          month: "long",
          year: "numeric",
        },
      );

      return {
        value,
        label,
      };
    },
  );

  return (
    <div className="space-y-6">
      {/* Header */}
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
          onChange={(e) =>
            setSelectedMonth(e.target.value)
          }
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          {monthOptions.map((month) => (
            <option
              key={month.value}
              value={month.value}
            >
              {month.label}
            </option>
          ))}
        </select>
      </div>

      {/* Statistics */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Sales"
          value={
            loading
              ? "Loading..."
              : formatCurrency(
                  dashboardSummary.sales,
                  settings?.currency,
                )
          }
          icon={FaMoneyBillWave}
          description="This month"
        />

        <StatCard
          title="Total Orders"
          value={
            loading
              ? "..."
              : dashboardSummary.orders
          }
          icon={FaShoppingCart}
          description="This month"
        />

        <StatCard
          title="Net Profit"
          value={
            loading
              ? "Loading..."
              : formatCurrency(
                  dashboardSummary.profit,
                  settings?.currency,
                )
          }
          icon={FaChartLine}
          description="This month"
        />

        <StatCard
          title="Total Products"
          value={
            loading
              ? "..."
              : activeProducts.length
          }
          icon={FaBox}
          description="Currently active"
        />
      </div>

      {/* Sales Overview + Low Stock */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SalesOverview
            salesOverview={salesOverview}
            selectedMonth={selectedMonth}
          />
        </div>

        <LowStockAlerts
          products={lowStockProducts}
        />
      </div>

      {/* Sales by Category + Recent Transactions */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SalesByCategory
          salesByCategory={salesByCategory}
        />

        <RecentTransactions
          sales={selectedSales}
        />
      </div>

      {/* Quick Actions */}
      <QuickActions />
    </div>
  );
}

export default ManagementDashboard;