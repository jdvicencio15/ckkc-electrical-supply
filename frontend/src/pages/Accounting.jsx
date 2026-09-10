import { useEffect, useMemo, useState } from "react";
import {
  FaCalculator,
  FaCheckCircle,
  FaExclamationTriangle,
  FaBook,
  FaBalanceScale,
  FaFileInvoiceDollar,
} from "react-icons/fa";
import { Link } from "react-router-dom";

import accountingApi from "../api/accountingApi";

function Accounting() {
  const [accounts, setAccounts] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);

  const [trialBalance, setTrialBalance] = useState({
    totalDebit: 0,
    totalCredit: 0,
    isBalanced: false,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        accountsResponse,
        journalEntriesResponse,
        trialBalanceResponse,
      ] = await Promise.all([
        accountingApi.getAccounts(),
        accountingApi.getJournalEntries(),
        accountingApi.getTrialBalance(),
      ]);

      const accountData =
        accountsResponse?.data ||
        accountsResponse ||
        [];

      const journalData =
        journalEntriesResponse?.data ||
        journalEntriesResponse ||
        [];

      const trialBalanceData =
        trialBalanceResponse?.data ||
        {};

      setAccounts(
        Array.isArray(accountData)
          ? accountData
          : []
      );

      setJournalEntries(
        Array.isArray(journalData)
          ? journalData
          : []
      );

      setTrialBalance({
        totalDebit: Number(
          trialBalanceData.totalDebit || 0
        ),
        totalCredit: Number(
          trialBalanceData.totalCredit || 0
        ),
        isBalanced: Boolean(
          trialBalanceData.isBalanced
        ),
      });
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to load accounting dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

const financialSummary = useMemo(() => {
  const totals = {
    assets: 0,
    liabilities: 0,
    equity: 0,
    revenue: 0,
    expenses: 0,
  };

  for (const journalEntry of journalEntries) {
    for (const entry of journalEntry.entries || []) {
      if (!entry.account) continue;

      const debit = Number(entry.debit || 0);
      const credit = Number(entry.credit || 0);

      switch (entry.account.accountType) {
        case "asset":
          totals.assets += debit - credit;
          break;

        case "liability":
          totals.liabilities += credit - debit;
          break;

        case "equity":
          totals.equity += credit - debit;
          break;

        case "revenue":
          totals.revenue += credit - debit;
          break;

        case "expense":
          totals.expenses += debit - credit;
          break;

        default:
          break;
      }
    }
  }

  return {
    assets: Number(totals.assets.toFixed(2)),
    liabilities: Number(totals.liabilities.toFixed(2)),
    equity: Number(totals.equity.toFixed(2)),
    revenue: Number(totals.revenue.toFixed(2)),
    expenses: Number(totals.expenses.toFixed(2)),
    netIncome: Number(
      (totals.revenue - totals.expenses).toFixed(2)
    ),
  };
}, [journalEntries]);

  const accountBalances = useMemo(() => {
    const balances = {};

    for (const journalEntry of journalEntries) {
      for (const entry of journalEntry.entries || []) {
        if (!entry.account) continue;

        const accountId = entry.account._id;

        if (!balances[accountId]) {
          balances[accountId] = {
            account: entry.account,
            balance: 0,
          };
        }

        const debit = Number(entry.debit || 0);
        const credit = Number(entry.credit || 0);

        if (
          entry.account.accountType === "asset" ||
          entry.account.accountType === "expense"
        ) {
          balances[accountId].balance +=
            debit - credit;
        } else {
          balances[accountId].balance +=
            credit - debit;
        }
      }
    }

    return Object.values(balances)
      .sort((a, b) =>
        a.account.accountCode.localeCompare(
          b.account.accountCode
        )
      )
      .slice(0, 6);
  }, [journalEntries]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
      "en-PH",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-slate-100 p-3 dark:bg-slate-800">
            <FaCalculator className="text-xl text-slate-700 dark:text-slate-200" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Accounting
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Monitor your financial records and accounting activities.
            </p>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
          <FaExclamationTriangle className="mt-0.5" />

          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Financial Summary */}
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <p className="text-sm text-slate-500 dark:text-slate-400">
      Total Assets
    </p>

    <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
      {loading
        ? "..."
        : formatCurrency(
            financialSummary.assets
          )}
    </p>
  </div>

  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <p className="text-sm text-slate-500 dark:text-slate-400">
      Total Liabilities
    </p>

    <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
      {loading
        ? "..."
        : formatCurrency(
            financialSummary.liabilities
          )}
    </p>
  </div>

  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <p className="text-sm text-slate-500 dark:text-slate-400">
      Total Revenue
    </p>

    <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
      {loading
        ? "..."
        : formatCurrency(
            financialSummary.revenue
          )}
    </p>
  </div>

  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <p className="text-sm text-slate-500 dark:text-slate-400">
      Total Expenses
    </p>

    <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
      {loading
        ? "..."
        : formatCurrency(
            financialSummary.expenses
          )}
    </p>
  </div>
</div>

      {/* Net Income */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Net Income
            </p>

            <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
              {loading
                ? "..."
                : formatCurrency(
                    financialSummary.netIncome
                  )}
            </p>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Revenue less expenses
            </p>
          </div>

          <div className="rounded-lg bg-slate-100 p-4 dark:bg-slate-800">
            <FaFileInvoiceDollar className="text-2xl text-slate-600 dark:text-slate-300" />
          </div>
        </div>
      </div>

      {/* Accounting Overview */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Journal Entries */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Recent Journal Entries
                </h2>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Latest accounting transactions.
                </p>
              </div>

              <Link
                to="/accounting/journal-entries"
                className="text-xs font-medium text-slate-600 hover:underline dark:text-slate-300"
              >
                View All
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
              Loading journal entries...
            </div>
          ) : journalEntries.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
              No journal entries found.
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {journalEntries
                .slice(0, 5)
                .map((entry) => {
                  const amount = (
                    entry.entries || []
                  ).reduce(
                    (total, line) =>
                      total +
                      Number(line.debit || 0),
                    0
                  );

                  return (
                    <div
                      key={entry._id}
                      className="px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                            {entry.reference || "No Reference"}
                          </p>

                          <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                            {entry.description}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {formatDate(entry.date)}
                          </p>
                        </div>

                        <p className="whitespace-nowrap text-sm font-semibold text-slate-900 dark:text-white">
                          {formatCurrency(amount)}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Account Balances */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
         <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Account Balances
                </h2>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Current balances across accounts.
                </p>
              </div>

              <Link
                to="/accounting/chart-of-accounts"
                className="text-xs font-medium text-slate-600 hover:underline dark:text-slate-300"
              >
                View Accounts
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
              Loading account balances...
            </div>
          ) : accountBalances.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
              No account balances available.
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {accountBalances.map((item) => (
                <div
                  key={item.account._id}
                  className="flex items-center justify-between gap-4 px-6 py-4"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {item.account.accountName}
                    </p>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {item.account.accountCode}
                    </p>
                  </div>

                  <p
                    className={`whitespace-nowrap text-sm font-semibold ${
                      item.balance < 0
                        ? "text-red-500"
                        : "text-slate-900 dark:text-white"
                    }`}
                  >
                    {formatCurrency(item.balance)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Accounting Health */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Accounting Health
            </h2>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Quick overview of your accounting records.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {trialBalance.isBalanced ? (
              <FaCheckCircle className="text-emerald-500" />
            ) : (
              <FaExclamationTriangle className="text-red-500" />
            )}

            <span
              className={`text-sm font-semibold ${
                trialBalance.isBalanced
                  ? "text-emerald-600"
                  : "text-red-500"
              }`}
            >
              {trialBalance.isBalanced
                ? "Trial Balance Balanced"
                : "Trial Balance Out of Balance"}
            </span>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Chart of Accounts
            </p>

            <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              {accounts.length}
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Journal Entries
            </p>

            <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              {journalEntries.length}
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Trial Balance Difference
            </p>

            <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(
                Math.abs(
                  trialBalance.totalDebit -
                    trialBalance.totalCredit
                )
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Accounting Actions */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Quick Actions
        </h2>

        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            to="/accounting/journal-entries"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <FaFileInvoiceDollar />
            Journal Entries
          </Link>

          <Link
            to="/accounting/general-ledger"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <FaBook />
            General Ledger
          </Link>

          <Link
            to="/accounting/trial-balance"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <FaBalanceScale />
            Trial Balance
          </Link>

          <Link
            to="/accounting/chart-of-accounts"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <FaCalculator />
            Chart of Accounts
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Accounting;