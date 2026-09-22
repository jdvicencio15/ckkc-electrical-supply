import { useEffect, useState } from "react";

import {
  FaTruck,
  FaClipboardList,
  FaExclamationTriangle,
} from "react-icons/fa";

import dashboardService from "../../services/dashboardService";

import StatCard from "./StatCard";
import LowStockAlerts from "./LowStockAlerts";
import QuickActions from "./QuickActions";

import { useSettings } from "../../context/SettingsContext";
import { formatCurrency } from "../../utils/currency";

function PurchasingDashboard() {
  const { settings } = useSettings();

  const [summary, setSummary] = useState({
    purchases: 0,
    pendingPOs: 0,
    lowStock: 0,
  });

  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);

        const [
          summaryResponse,
          productResponse,
        ] = await Promise.all([
          dashboardService.getTodaySummary(),
          dashboardService.getProducts(),
        ]);

        setSummary(
          summaryResponse.summary || {
            purchases: 0,
            pendingPOs: 0,
            lowStock: 0,
          },
        );

        setProducts(
          productResponse.products || [],
        );
      } catch (error) {
        console.error(
          "Failed to load purchasing dashboard:",
          error,
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const lowStockProducts = products.filter(
    (product) =>
      product.status === "active" &&
      product.currentStock <= product.minimumStock,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Purchasing Dashboard
        </h1>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Overview of purchasing and inventory needs.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Today's Purchases"
          value={
            loading
              ? "Loading..."
              : formatCurrency(
                  summary.purchases,
                  settings?.currency,
                )
          }
          icon={FaTruck}
          description="Received purchases today"
        />

        <StatCard
          title="Pending Supplier POs"
          value={
            loading
              ? "..."
              : summary.pendingPOs
          }
          icon={FaClipboardList}
          description="Require purchasing attention"
        />

        <StatCard
          title="Low Stock Items"
          value={
            loading
              ? "..."
              : summary.lowStock
          }
          icon={FaExclamationTriangle}
          description="At or below minimum stock"
        />
      </div>

      <LowStockAlerts
        products={lowStockProducts}
      />

      <QuickActions />
    </div>
  );
}

export default PurchasingDashboard;