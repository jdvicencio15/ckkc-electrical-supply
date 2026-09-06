import { useEffect, useMemo, useState } from "react";
import {
  FaBook,
  FaFilter,
  FaSyncAlt,
  FaExclamationTriangle,
} from "react-icons/fa";

import accountingApi from "../../api/accountingApi";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";

function GeneralLedger() {
  const [accounts, setAccounts] = useState([]);
  const [ledger, setLedger] = useState([]);

const [selectedAccount, setSelectedAccount] =
  useState("");

const [appliedAccount, setAppliedAccount] =
  useState("");

const [selectedAccountInfo, setSelectedAccountInfo] =
  useState(null);

  const [openingBalance, setOpeningBalance] = useState(0);
  const [endingBalance, setEndingBalance] = useState(0);

  const [backendTotalDebit, setBackendTotalDebit] =
    useState(0);
  const [backendTotalCredit, setBackendTotalCredit] =
    useState(0);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

 const isSpecificAccount = Boolean(appliedAccount);

  const accountOptions = useMemo(() => {
    return [
      {
        value: "",
        label: "All Accounts",
      },
      ...accounts
        .filter((account) => account.isActive)
        .sort((a, b) =>
          a.accountCode.localeCompare(b.accountCode)
        )
        .map((account) => ({
          value: account._id,
          label: `${account.accountCode} - ${account.accountName}`,
        })),
    ];
  }, [accounts]);

  const fetchData = async (filters = {}) => {
    try {
      setLoading(true);
        setError("");


      const [accountsResponse, ledgerResponse] =
        await Promise.all([
          accountingApi.getAccounts(),
          accountingApi.getGeneralLedger(filters),
        ]);

      const accountData =
        accountsResponse?.data ||
        accountsResponse ||
        [];

      setAccounts(accountData);

      const responseData =
        ledgerResponse?.data ||
        ledgerResponse ||
            [];


      /*
       * Specific account response:
       *
       * data: {
       *   account,
       *   openingBalance,
       *   transactions,
       *   totalDebit,
       *   totalCredit,
       *   endingBalance
       * }
       */
      if (
        filters.accountId &&
        !Array.isArray(responseData)
      ) {
        setSelectedAccountInfo(
          responseData.account || null
        );

        setOpeningBalance(
          Number(responseData.openingBalance || 0)
        );

        setEndingBalance(
          Number(responseData.endingBalance || 0)
        );

        setBackendTotalDebit(
          Number(responseData.totalDebit || 0)
        );

        setBackendTotalCredit(
          Number(responseData.totalCredit || 0)
        );

        setLedger(
          Array.isArray(responseData.transactions)
            ? responseData.transactions
            : []
        );

        return;
      }

      /*
       * All Accounts response:
       *
       * data: [
       *   { ...ledgerEntry },
       *   { ...ledgerEntry }
       * ]
       */
      setSelectedAccountInfo(null);
      setOpeningBalance(0);
      setEndingBalance(0);
      setBackendTotalDebit(0);
      setBackendTotalCredit(0);

      setLedger(
        Array.isArray(responseData)
          ? responseData
          : []
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to load general ledger."
      );

      setLedger([]);
      setSelectedAccountInfo(null);
      setOpeningBalance(0);
      setEndingBalance(0);
      setBackendTotalDebit(0);
      setBackendTotalCredit(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

const handleApplyFilter = async () => {
  if (
    startDate &&
    endDate &&
    startDate > endDate
  ) {
    setError(
      "Start date cannot be later than end date."
    );
    return;
  }

  setAppliedAccount(selectedAccount);

  await fetchData({
    ...(selectedAccount && {
      accountId: selectedAccount,
    }),
    ...(startDate && {
      startDate,
    }),
    ...(endDate && {
      endDate,
    }),
  });
};

const handleClearFilter = async () => {
  setSelectedAccount("");
  setAppliedAccount("");
  setStartDate("");
  setEndDate("");

  await fetchData();
};

  const totalDebit = useMemo(() => {
    if (isSpecificAccount) {
      return backendTotalDebit;
    }

    return ledger.reduce(
      (total, entry) =>
        total + Number(entry.debit || 0),
      0
    );
  }, [
    ledger,
    isSpecificAccount,
    backendTotalDebit,
  ]);

  const totalCredit = useMemo(() => {
    if (isSpecificAccount) {
      return backendTotalCredit;
    }

    return ledger.reduce(
      (total, entry) =>
        total + Number(entry.credit || 0),
      0
    );
  }, [
    ledger,
    isSpecificAccount,
    backendTotalCredit,
  ]);

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
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-slate-100 p-3 dark:bg-slate-800">
              <FaBook className="text-xl text-slate-700 dark:text-slate-200" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                General Ledger
              </h1>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                View account transactions and running balances.
              </p>
            </div>
          </div>
        </div>

        <Button
          type="button"
          variant="secondary"
     onClick={() =>
  fetchData({
    ...(appliedAccount && {
      accountId: appliedAccount,
    }),
    ...(startDate && {
      startDate,
    }),
    ...(endDate && {
      endDate,
    }),
  })
}
          disabled={loading}
        >
          <FaSyncAlt
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-4 flex items-center gap-2">
          <FaFilter className="text-slate-500" />

          <h2 className="font-semibold text-slate-900 dark:text-white">
            Ledger Filters
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Select
            label="Account"
            value={selectedAccount}
            onChange={(e) =>
              setSelectedAccount(e.target.value)
            }
            options={accountOptions}
          />

          <Input
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) =>
              setStartDate(e.target.value)
            }
          />

          <Input
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) =>
              setEndDate(e.target.value)
            }
          />
        </div>

        <div className="mt-4 flex flex-wrap justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClearFilter}
            disabled={loading}
          >
            Clear
          </Button>

          <Button
            type="button"
            onClick={handleApplyFilter}
            disabled={loading}
          >
            <FaFilter />
            Apply Filter
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
          <FaExclamationTriangle className="mt-0.5" />

          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Specific Account Header */}
      {isSpecificAccount &&
        selectedAccountInfo && (
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Account
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                  {selectedAccountInfo.accountCode} -{" "}
                  {selectedAccountInfo.accountName}
                </h2>

                <p className="mt-1 text-sm capitalize text-slate-500 dark:text-slate-400">
                  {selectedAccountInfo.accountType}
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 px-5 py-3 dark:bg-slate-800">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Beginning Balance
                </p>

                <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(openingBalance)}
                </p>
              </div>
            </div>
          </div>
        )}

      {/* Summary */}
      <div
        className={`grid grid-cols-1 gap-4 ${
          isSpecificAccount
            ? "md:grid-cols-4"
            : "md:grid-cols-3"
        }`}
      >
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Ledger Entries
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            {ledger.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Total Debit
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(totalDebit)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Total Credit
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(totalCredit)}
          </p>
        </div>

        {isSpecificAccount && (
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Ending Balance
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(endingBalance)}
            </p>
          </div>
        )}
      </div>

      {/* Ledger Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-700">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">
                Ledger Transactions
              </h2>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isSpecificAccount
                  ? "Account-specific transaction history"
                  : "All account transaction activity"}
              </p>
            </div>

            {isSpecificAccount && (
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Ending:{" "}
                {formatCurrency(endingBalance)}
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500 dark:text-slate-400">
            Loading general ledger...
          </div>
        ) : ledger.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500 dark:text-slate-400">
            No ledger transactions found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Date
                  </th>

                  {!isSpecificAccount && (
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Account
                    </th>
                  )}

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Reference
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Description
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Debit
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Credit
                  </th>

                  {isSpecificAccount && (
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Balance
                    </th>
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {ledger.map((entry, index) => (
                  <tr
                    key={`${entry.journalEntryId}-${entry.account?._id}-${index}`}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-700 dark:text-slate-300">
                      {formatDate(entry.date)}
                    </td>

                    {!isSpecificAccount && (
                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-900 dark:text-white">
                          {entry.account?.accountName ||
                            "Unknown Account"}
                        </div>

                        <div className="text-xs text-slate-500">
                          {entry.account?.accountCode ||
                            "-"}
                        </div>
                      </td>
                    )}

                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-700 dark:text-slate-300">
                      {entry.reference || "-"}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-700 dark:text-slate-300">
                      {entry.description}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-right text-sm font-medium text-slate-900 dark:text-white">
                      {Number(entry.debit || 0) > 0
                        ? formatCurrency(entry.debit)
                        : "-"}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-right text-sm font-medium text-slate-900 dark:text-white">
                      {Number(entry.credit || 0) > 0
                        ? formatCurrency(entry.credit)
                        : "-"}
                    </td>

                    {isSpecificAccount && (
                      <td className="whitespace-nowrap px-5 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(entry.balance)}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>

              <tfoot className="border-t border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                <tr>
                  <td
                    colSpan={
                      isSpecificAccount ? 4 : 4
                    }
                    className="px-5 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white"
                  >
                    Total
                  </td>

                  <td className="px-5 py-4 text-right text-sm font-bold text-slate-900 dark:text-white">
                    {formatCurrency(totalDebit)}
                  </td>

                  <td className="px-5 py-4 text-right text-sm font-bold text-slate-900 dark:text-white">
                    {formatCurrency(totalCredit)}
                  </td>

                  {isSpecificAccount && (
                    <td className="px-5 py-4 text-right text-sm font-bold text-slate-900 dark:text-white">
                      {formatCurrency(endingBalance)}
                    </td>
                  )}
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default GeneralLedger;