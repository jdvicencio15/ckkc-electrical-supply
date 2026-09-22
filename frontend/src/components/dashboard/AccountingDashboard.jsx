import { useEffect, useState } from "react";

import {
  FaMoneyBillWave,
  FaCreditCard,
  FaFileInvoiceDollar,
} from "react-icons/fa";

import dashboardService from "../../services/dashboardService";

import StatCard from "./StatCard";
import QuickActions from "./QuickActions";

import { useSettings } from "../../context/SettingsContext";
import { formatCurrency } from "../../utils/currency";

function AccountingDashboard() {
  const { settings } = useSettings();

  const [summary, setSummary] = useState({
    sales: 0,
    payments: 0,
    receivables: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);

        const response =
          await dashboardService.getTodaySummary();

        setSummary(
          response.summary || {
            sales: 0,
            payments: 0,
            receivables: 0,
          },
        );
      } catch (error) {
        console.error(
          "Failed to load accounting dashboard:",
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
          Accounting Dashboard
        </h1>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Overview of today's financial activity.
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
          title="Today's Payments"
          value={
            loading
              ? "Loading..."
              : formatCurrency(
                  summary.payments,
                  settings?.currency,
                )
          }
          icon={FaCreditCard}
          description="Payments recorded today"
        />

        <StatCard
          title="Receivables"
          value={
            loading
              ? "Loading..."
              : formatCurrency(
                  summary.receivables,
                  settings?.currency,
                )
          }
          icon={FaFileInvoiceDollar}
          description="Outstanding issued invoices"
        />
      </div>

      <QuickActions />
    </div>
  );
}

export default AccountingDashboard;