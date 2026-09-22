import { useState } from "react";
import { useSettings } from "../../context/SettingsContext";
import { formatCurrency } from "../../utils/currency";

function SalesOverview({
  salesOverview = [],
  selectedMonth,
}) {
  const { settings } = useSettings();

  const [selectedPeriod, setSelectedPeriod] = useState("this-month");

  // ==============================
  // SELECTED DASHBOARD MONTH
  // ==============================

  const [selectedYear, selectedMonthNumber] = selectedMonth
    ? selectedMonth.split("-").map(Number)
    : [new Date().getFullYear(), new Date().getMonth() + 1];

  // ==============================
  // GET MONTH SALES
  // ==============================

  const getMonthSales = (year, month) => {
    const result = salesOverview.find(
      (item) =>
        item.year === year &&
        item.month === month
    );

    return result?.sales || 0;
  };

  // ==============================
  // MONTH OFFSET HELPER
  // ==============================

  const getMonthDate = (offset = 0) => {
    return new Date(
      selectedYear,
      selectedMonthNumber - 1 + offset,
      1
    );
  };

  // ==============================
  // CURRENT / PREVIOUS PERIOD
  // ==============================

  let currentSales = 0;
  let previousSales = 0;

  if (selectedPeriod === "this-month") {
    currentSales = getMonthSales(
      selectedYear,
      selectedMonthNumber
    );

    const previousMonth = getMonthDate(-1);

    previousSales = getMonthSales(
      previousMonth.getFullYear(),
      previousMonth.getMonth() + 1
    );
  }

  if (selectedPeriod === "last-month") {
    const currentMonth = getMonthDate(-1);
    const previousMonth = getMonthDate(-2);

    currentSales = getMonthSales(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1
    );

    previousSales = getMonthSales(
      previousMonth.getFullYear(),
      previousMonth.getMonth() + 1
    );
  }

  if (selectedPeriod === "last-3-months") {
    const currentMonth = getMonthDate(-2);
    const previousMonth = getMonthDate(-5);

    currentSales = 0;
    previousSales = 0;

    // Current 3-month total
    for (let i = -2; i <= 0; i++) {
      const month = getMonthDate(i);

      currentSales += getMonthSales(
        month.getFullYear(),
        month.getMonth() + 1
      );
    }

    // Previous 3-month total
    for (let i = -5; i <= -3; i++) {
      const month = getMonthDate(i);

      previousSales += getMonthSales(
        month.getFullYear(),
        month.getMonth() + 1
      );
    }
  }

  // ==============================
  // PERCENTAGE CHANGE
  // ==============================

  let percentageChange = 0;

  if (previousSales === 0) {
    if (currentSales > 0) {
      percentageChange = 100;
    }
  } else {
    percentageChange =
      ((currentSales - previousSales) / previousSales) * 100;
  }

  const roundedPercentage =
    Math.abs(percentageChange).toFixed(1);

  let changeLabel = "No change";

  let changeClass =
    "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";

  if (currentSales === 0 && previousSales === 0) {
    changeLabel = "No sales";
  }

  if (percentageChange > 0) {
    changeLabel =
      previousSales === 0
        ? "↑ New sales"
        : `↑ ${roundedPercentage}%`;

    changeClass =
      "bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400";
  }

  if (percentageChange < 0) {
    changeLabel = `↓ ${roundedPercentage}%`;

    changeClass =
      "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400";
  }

  // ==============================
  // SALES DATA
  // ==============================

  const salesData = [];

  if (selectedPeriod === "this-month") {
    const month = getMonthDate(0);

    salesData.push({
      year: month.getFullYear(),
      monthNumber: month.getMonth() + 1,
      month: month.toLocaleDateString("en-US", {
        month: "short",
      }),
      sales: getMonthSales(
        month.getFullYear(),
        month.getMonth() + 1
      ),
    });
  }

  if (selectedPeriod === "last-month") {
    const month = getMonthDate(-1);

    salesData.push({
      year: month.getFullYear(),
      monthNumber: month.getMonth() + 1,
      month: month.toLocaleDateString("en-US", {
        month: "short",
      }),
      sales: getMonthSales(
        month.getFullYear(),
        month.getMonth() + 1
      ),
    });
  }

  if (selectedPeriod === "last-3-months") {
    for (let i = -2; i <= 0; i++) {
      const month = getMonthDate(i);

      salesData.push({
        year: month.getFullYear(),
        monthNumber: month.getMonth() + 1,
        month: month.toLocaleDateString("en-US", {
          month: "short",
        }),
        sales: getMonthSales(
          month.getFullYear(),
          month.getMonth() + 1
        ),
      });
    }
  }

  // ==============================
  // CHART SCALE
  // ==============================

  const maxSales = Math.max(
    ...salesData.map((data) => data.sales),
    1
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Sales Overview
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Monthly sales performance
          </p>
        </div>

        <select
          value={selectedPeriod}
          onChange={(e) =>
            setSelectedPeriod(e.target.value)
          }
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none transition focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:focus:border-green-500"
        >
          <option value="this-month">
            This Month
          </option>

          <option value="last-month">
            Last Month
          </option>

          <option value="last-3-months">
            Last 3 Months
          </option>
        </select>
      </div>

      {/* Summary */}
      <div className="mb-5">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Total Sales
        </p>

        <div className="mt-1 flex items-center gap-3">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {formatCurrency(
              currentSales,
              settings?.currency
            )}
          </h3>

          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${changeClass}`}
          >
            {changeLabel}
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-64">
        {/* Grid Lines */}
        <div className="absolute inset-x-0 top-0 border-t border-slate-100 dark:border-slate-800" />

        <div className="absolute inset-x-0 top-1/4 border-t border-slate-100 dark:border-slate-800" />

        <div className="absolute inset-x-0 top-1/2 border-t border-slate-100 dark:border-slate-800" />

        <div className="absolute inset-x-0 top-3/4 border-t border-slate-100 dark:border-slate-800" />

        <div className="absolute inset-x-0 bottom-6 border-t border-slate-200 dark:border-slate-700" />

        {/* Sales Bars */}
        <div className="absolute inset-x-0 bottom-8 top-4 flex items-end justify-between gap-4 px-6">
          {salesData.map((item) => {
            const height =
              (item.sales / maxSales) * 100;

            return (
              <div
                key={`${item.year}-${item.monthNumber}`}
                className="flex h-full flex-1 items-end justify-center"
              >
                <div
                  className="w-full max-w-16 rounded-t-md bg-green-500 transition-all"
                  style={{
                    height: `${
                      Math.max(
                        height,
                        item.sales > 0 ? 5 : 0
                      )
                    }%`,
                  }}
                  title={formatCurrency(
                    item.sales,
                    settings?.currency
                  )}
                />
              </div>
            );
          })}
        </div>

        {/* Green Baseline */}
        <div className="absolute inset-x-0 bottom-6 h-0.5 bg-green-500/30" />

        {/* Month Labels */}
        <div className="absolute inset-x-0 bottom-0 flex justify-between px-6">
          {salesData.map((item) => (
            <span
              key={`${item.year}-${item.monthNumber}`}
              className="text-xs text-slate-400 dark:text-slate-500"
            >
              {item.month}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SalesOverview;