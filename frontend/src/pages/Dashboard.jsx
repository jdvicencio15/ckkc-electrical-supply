import { useEffect, useState } from "react";
import dashboardService from "../services/dashboardService";

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

  const currentDate = new Date();

  const currentMonth = `${currentDate.getFullYear()}-${String(
    currentDate.getMonth() + 1,
  ).padStart(2, "0")}`;

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  const [products, setProducts] = useState([]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await dashboardService.getSales();
        const productResponse = await dashboardService.getProducts();

        setSales(response.sales || []);
        setProducts(productResponse.products || []);
      } catch (error) {
        console.error("Failed to load dashboard sales:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const selectedSales = sales.filter((sale) => {
    if (!sale.saleDate) return false;

    return sale.saleDate.startsWith(selectedMonth);
  });

  const totalSales = selectedSales.reduce(
    (total, sale) => total + (sale.totalAmount || 0),
    0,
  );

  const totalOrders = selectedSales.length;

  const netProfit  = selectedSales.reduce(
    (total, sale) => total + (sale.totalProfit || 0),
    0,
  );

  const activeProducts = products.filter(
    (product) => product.status === "active",
  );

  const totalProducts = activeProducts.length;

  const lowStockProducts = products.filter(
    (product) =>
      product.status === "active" &&
      product.currentStock <= product.minimumStock,
  );

  const monthOptions = Array.from({ length: 12 }, (_, index) => {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - index,
      1,
    );

    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0",
    )}`;

    const label = date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    return {
      value,
      label,
    };
  });


useEffect(() => {
  const loadDashboard = async () => {
    try {
      const response = await dashboardService.getSales();
      const productResponse = await dashboardService.getProducts();


      setSales(response.sales || []);
      setProducts(productResponse.products || []);
    } catch (error) {
      console.error("Failed to load dashboard sales:", error);
    } finally {
      setLoading(false);
    }
  };

  loadDashboard();
}, []);


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
          {monthOptions.map((month) => (
            <option key={month.value} value={month.value}>
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
              : `₱${totalSales.toLocaleString("en-PH", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
          }
          icon={FaMoneyBillWave}
          description="This month"
        />

        <StatCard
          title="Total Orders"
          value={loading ? "..." : totalOrders}
          icon={FaShoppingCart}
          description="This month"
        />

        <StatCard
           title="Net Profit"
          value={
            loading
              ? "Loading..."
              : `₱${netProfit.toLocaleString("en-PH", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
          }
          icon={FaChartLine}
          description="This month"
        />

        <StatCard
          title="Total Products"
          value={loading ? "..." : totalProducts}
          icon={FaBox}
          description="Currently active"
        />
      </div>

      {/* Sales Overview + Low Stock */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SalesOverview sales={sales} />
        </div>

        <LowStockAlerts products={lowStockProducts} />
      </div>

      {/* Sales by Category + Recent Transactions */}
      <div className="grid gap-6 lg:grid-cols-2">
     <SalesByCategory
  sales={selectedSales}
  products={products}
/>

       <RecentTransactions sales={selectedSales} />
      </div>

      {/* Quick Actions */}
      <QuickActions />
    </div>
  );
}

export default Dashboard;
