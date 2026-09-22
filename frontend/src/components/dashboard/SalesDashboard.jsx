import { useEffect, useState } from "react";

import {
  FaMoneyBillWave,
  FaShoppingCart,
  FaFileAlt,
} from "react-icons/fa";

import dashboardService from "../../services/dashboardService";

import StatCard from "./StatCard";
import QuickActions from "./QuickActions";
import RecentTransactions from "./RecentTransactions";

import { useSettings } from "../../context/SettingsContext";
import { formatCurrency } from "../../utils/currency";

function SalesDashboard() {
  const { settings } = useSettings();

  const [summary, setSummary] = useState({
    sales: 0,
    orders: 0,
    quotations: 0,
  });

  const [sales, setSales] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);

        const [
          summaryResponse,
          salesResponse,
        ] = await Promise.all([
          dashboardService.getTodaySummary(),
          dashboardService.getSales(),
        ]);

        setSummary(
          summaryResponse.summary || {
            sales: 0,
            orders: 0,
            quotations: 0,
          },
        );

        setSales(
          (salesResponse.sales || []).filter(
            (sale) => sale.status === "released",
          ),
        );
      } catch (error) {
        console.error(
          "Failed to load sales dashboard:",
          error,
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Sales Dashboard
        </h1>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Overview of today's sales activities.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Today's Sales"
          value={
            loading
              ? "Loading..."
              : formatCurrency(
                  summary.sales,
                  settings?.currency,
                )
          }
          icon={FaMoneyBillWave}
          description="Released sales today"
        />

        <StatCard
          title="Today's Orders"
          value={
            loading
              ? "..."
              : summary.orders
          }
          icon={FaShoppingCart}
          description="Released orders today"
        />

        <StatCard
          title="Today's Quotations"
          value={
            loading
              ? "..."
              : summary.quotations
          }
          icon={FaFileAlt}
          description="Quotations created today"
        />
      </div>

      <RecentTransactions sales={sales} />

      <QuickActions />
    </div>
  );
}

export default SalesDashboard;