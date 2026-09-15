
import { useEffect, useMemo, useState } from "react";
import { FaEdit, FaPlus, FaTrash, FaCheck } from "react-icons/fa";

import expenseService from "../../services/expenseService";
import accountingApi from "../../api/accountingApi";
import saleService from "../../services/saleService";
import clientPOService from "../../services/clientPOService";

import ExpenseForm from "../../components/expenses/ExpenseForm";
import ExpenseSummary from "../../components/expenses/ExpenseSummary";
import ExpenseFilters from "../../components/expenses/ExpenseFilters";

import Toast from "../../components/common/Toast";
import ConfirmModal from "../../components/ui/ConfirmModal";

import { useAuth } from "../../context/AuthContext";
import { useSettings } from "../../context/SettingsContext";
import { formatCurrency } from "../../utils/currency";

function Expenses() {
  const { user } = useAuth();
  const { settings } = useSettings();

  const [expenses, setExpenses] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [references, setReferences] = useState([]);

  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    category: "all",
    dateFrom: "",
    dateTo: "",
  });

  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [toast, setToast] = useState({
    type: "success",
    message: "",
  });

  /*
  |--------------------------------------------------------------------------
  | Permissions
  |--------------------------------------------------------------------------
  */

  const canManageExpenses =
    user?.role === "owner" ||
    user?.role === "admin" ||
    user?.role === "accounting";

  /*
  |--------------------------------------------------------------------------
  | Load Expenses
  |--------------------------------------------------------------------------
  */

  const loadExpenses = async () => {
    const response = await expenseService.getExpenses();

    setExpenses(response.expenses || []);
  };

  /*
  |--------------------------------------------------------------------------
  | Load Page Data
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const loadData = async () => {
      try {
        setError("");

        const [
          expenseResponse,
          accountResponse,
          salesResponse,
          clientPOResponse,
        ] = await Promise.all([
          expenseService.getExpenses(),
          accountingApi.getAccounts(),
          saleService.getSales(),
          clientPOService.getClientPOs(),
        ]);

        setExpenses(expenseResponse.expenses || []);

       setAccounts(
  (accountResponse.data || []).filter(
    (account) =>
      account.isActive &&
      account.accountType === "expense",
  ),
);

        const sales = (salesResponse.sales || []).map((sale) => ({
          _id: sale._id,
          type: "SALE",
          label: sale.salesNumber,
          number: sale.salesNumber,
        }));

        const clientPOs = (
          clientPOResponse.clientPOs || []
        ).map((clientPO) => ({
          _id: clientPO._id,
          type: "CLIENT_PO",
          label:
            clientPO.poNumber ||
            clientPO.clientPONumber,
          number:
            clientPO.poNumber ||
            clientPO.clientPONumber,
        }));

        setReferences([
          ...sales,
          ...clientPOs,
        ]);
      } catch (error) {
        console.error(
          "Failed to load expenses:",
          error,
        );

        setError(
          error.response?.data?.message ||
            "Failed to load expense data.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Toast Auto Close
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!toast.message) {
      return;
    }

    const timer = setTimeout(() => {
      setToast({
        type: "success",
        message: "",
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast]);

  /*
  |--------------------------------------------------------------------------
  | Filtering
  |--------------------------------------------------------------------------
  */

  const filteredExpenses = useMemo(() => {
    const search = filters.search.trim().toLowerCase();

    return expenses.filter((expense) => {
      const matchesSearch =
        !search ||
        expense.description
          ?.toLowerCase()
          .includes(search) ||
        expense.category
          ?.toLowerCase()
          .includes(search) ||
        expense.expenseAccountId?.accountCode
          ?.toLowerCase()
          .includes(search) ||
        expense.expenseAccountId?.accountName
          ?.toLowerCase()
          .includes(search);

      const matchesStatus =
        filters.status === "all" ||
        expense.status === filters.status;

      const matchesCategory =
        filters.category === "all" ||
        expense.category === filters.category;

      const expenseDate = expense.expenseDate
        ? new Date(expense.expenseDate)
        : null;

      const matchesDateFrom =
        !filters.dateFrom ||
        (expenseDate &&
          expenseDate >=
            new Date(`${filters.dateFrom}T00:00:00`));

      const matchesDateTo =
        !filters.dateTo ||
        (expenseDate &&
          expenseDate <=
            new Date(`${filters.dateTo}T23:59:59.999`));

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory &&
        matchesDateFrom &&
        matchesDateTo
      );
    });
  }, [expenses, filters]);

  /*
  |--------------------------------------------------------------------------
  | Create
  |--------------------------------------------------------------------------
  */

  const handleCreate = async (formData) => {
    try {
      setFormLoading(true);
      setError("");

      await expenseService.createExpense(formData);

      await loadExpenses();

      setShowForm(false);

      setToast({
        type: "success",
        message: "Expense created successfully.",
      });
    } catch (error) {
      console.error(
        "Failed to create expense:",
        error,
      );

      setToast({
        type: "error",
        message:
          error.response?.data?.message ||
          "Failed to create expense.",
      });
    } finally {
      setFormLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Update
  |--------------------------------------------------------------------------
  */

  const handleUpdate = async (formData) => {
    if (!editingExpense) {
      return;
    }

    try {
      setFormLoading(true);
      setError("");

      await expenseService.updateExpense(
        editingExpense._id,
        formData,
      );

      await loadExpenses();

      setEditingExpense(null);
      setShowForm(false);

      setToast({
        type: "success",
        message: "Expense updated successfully.",
      });
    } catch (error) {
      console.error(
        "Failed to update expense:",
        error,
      );

      setToast({
        type: "error",
        message:
          error.response?.data?.message ||
          "Failed to update expense.",
      });
    } finally {
      setFormLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Confirmation Actions
  |--------------------------------------------------------------------------
  */

  const handleDelete = (expense) => {
    setConfirmAction({
      type: "delete",
      expense,
    });
  };

  const handlePost = (expense) => {
    setConfirmAction({
      type: "post",
      expense,
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmAction?.expense) {
      return;
    }

    const { type, expense } = confirmAction;

    try {
      setConfirmLoading(true);
      setError("");

      if (type === "delete") {
        await expenseService.deleteExpense(expense._id);
      }

      if (type === "post") {
        await expenseService.postExpense(expense._id);
      }

      await loadExpenses();

      setConfirmAction(null);

      setToast({
        type: "success",
        message:
          type === "delete"
            ? "Expense deleted successfully."
            : "Expense posted successfully and recognized in accounting.",
      });
    } catch (error) {
      console.error(
        `Failed to ${type} expense:`,
        error,
      );

      setToast({
        type: "error",
        message:
          error.response?.data?.message ||
          `Failed to ${type} expense.`,
      });
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleCancelConfirmation = () => {
    if (confirmLoading) {
      return;
    }

    setConfirmAction(null);
  };

  /*
  |--------------------------------------------------------------------------
  | Form Controls
  |--------------------------------------------------------------------------
  */

  const openCreateForm = () => {
    setEditingExpense(null);
    setShowForm(true);
    setError("");
  };

  const openEditForm = (expense) => {
    if ((expense.status || "draft") !== "draft") {
      return;
    }

    setEditingExpense(expense);
    setShowForm(true);
    setError("");
  };

  const closeForm = () => {
    if (formLoading) {
      return;
    }

    setShowForm(false);
    setEditingExpense(null);
  };

  /*
  |--------------------------------------------------------------------------
  | Toast
  |--------------------------------------------------------------------------
  */

  const closeToast = () => {
    setToast({
      type: "success",
      message: "",
    });
  };

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <>
      <Toast
        type={toast.type}
        message={toast.message}
        onClose={closeToast}
      />

      {/* Confirmation */}
      <ConfirmModal
        isOpen={!!confirmAction}
        onClose={handleCancelConfirmation}
        onConfirm={handleConfirmAction}
        title={
          confirmAction?.type === "delete"
            ? "Delete Expense"
            : "Post Expense"
        }
        message={
          confirmAction?.type === "delete"
            ? `Are you sure you want to delete "${
                confirmAction?.expense?.description ||
                "this expense"
              }"? This action cannot be undone.`
            : `Are you sure you want to post "${
                confirmAction?.expense?.description ||
                "this expense"
              }"? This will recognize the expense in accounting and lock the transaction.`
        }
        confirmText={
          confirmAction?.type === "delete"
            ? "Delete"
            : "Post Expense"
        }
        cancelText="Cancel"
        loading={confirmLoading}
        loadingText={
          confirmAction?.type === "delete"
            ? "Deleting..."
            : "Posting..."
        }
      />

      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Expenses
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Manage business expenses and their accounting recognition.
            </p>
          </div>

          {canManageExpenses && (
            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700"
            >
              <FaPlus className="h-3.5 w-3.5" />
              New Expense
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Summary */}
        <ExpenseSummary expenses={expenses} />

        {/* Expense Form */}
        {showForm && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {editingExpense
                  ? "Edit Expense"
                  : "New Expense"}
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {editingExpense
                  ? "Update the draft expense information."
                  : "Create a new expense transaction."}
              </p>
            </div>

            <ExpenseForm
              expense={editingExpense}
              accounts={accounts}
              references={references}
              onSubmit={
                editingExpense
                  ? handleUpdate
                  : handleCreate
              }
              onCancel={closeForm}
              loading={formLoading}
            />
          </div>
        )}

        {/* Filters */}
        <ExpenseFilters
          search={filters.search}
          status={filters.status}
          category={filters.category}
          dateFrom={filters.dateFrom}
          dateTo={filters.dateTo}
          onSearchChange={(value) =>
            setFilters((current) => ({
              ...current,
              search: value,
            }))
          }
          onStatusChange={(value) =>
            setFilters((current) => ({
              ...current,
              status: value,
            }))
          }
          onCategoryChange={(value) =>
            setFilters((current) => ({
              ...current,
              category: value,
            }))
          }
          onDateFromChange={(value) =>
            setFilters((current) => ({
              ...current,
              dateFrom: value,
            }))
          }
          onDateToChange={(value) =>
            setFilters((current) => ({
              ...current,
              dateTo: value,
            }))
          }
          onReset={() =>
            setFilters({
              search: "",
              status: "all",
              category: "all",
              dateFrom: "",
              dateTo: "",
            })
          }
        />

        {/* Expenses Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {loading ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Loading expenses...
              </p>
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                No expenses found.
              </p>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Try adjusting your search or filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                  <tr>
                    <th className="px-6 py-3 font-semibold">
                      Date
                    </th>

                    <th className="px-6 py-3 font-semibold">
                      Description
                    </th>

                    <th className="px-6 py-3 font-semibold">
                      Account
                    </th>

                    <th className="px-6 py-3 font-semibold">
                      Category
                    </th>

                    <th className="px-6 py-3 font-semibold">
                      Payment
                    </th>

                    <th className="px-6 py-3 text-right font-semibold">
                      Net
                    </th>

                    <th className="px-6 py-3 text-right font-semibold">
                      VAT
                    </th>

                    <th className="px-6 py-3 text-right font-semibold">
                      Total
                    </th>

                    <th className="px-6 py-3 font-semibold">
                      Status
                    </th>

                    {canManageExpenses && (
                      <th className="px-6 py-3 text-right font-semibold">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {[...filteredExpenses]
                    .sort(
                      (a, b) =>
                        new Date(
                          b.expenseDate || 0,
                        ) -
                        new Date(
                          a.expenseDate || 0,
                        ),
                    )
                    .map((expense) => {
                      const status =
                        expense.status || "draft";

                      return (
                        <tr
                          key={expense._id}
                          className="border-b border-slate-100 last:border-0 dark:border-slate-800"
                        >
                          {/* Date */}
                          <td className="whitespace-nowrap px-6 py-4 text-slate-500 dark:text-slate-400">
                            {expense.expenseDate
                              ? new Date(
                                  expense.expenseDate,
                                ).toLocaleDateString(
                                  "en-PH",
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  },
                                )
                              : "—"}
                          </td>

                          {/* Description */}
                          <td className="max-w-xs px-6 py-4">
                            <p className="font-medium text-slate-900 dark:text-slate-100">
                              {expense.description ||
                                "—"}
                            </p>

                            {expense.referenceType &&
                              expense.referenceType !==
                                "OTHER" && (
                                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                  Ref:{" "}
                                  {
                                    expense.referenceType
                                  }
                                </p>
                              )}
                          </td>

                          {/* Account */}
                          <td className="px-6 py-4">
                            <p className="font-medium text-slate-900 dark:text-slate-100">
                              {expense
                                .expenseAccountId
                                ?.accountName ||
                                "Unknown Account"}
                            </p>

                            {expense
                              .expenseAccountId
                              ?.accountCode && (
                              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                {
                                  expense
                                    .expenseAccountId
                                    .accountCode
                                }
                              </p>
                            )}
                          </td>

                          {/* Category */}
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                            {expense.category || "—"}
                          </td>

                          {/* Payment */}
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                            {expense.paymentMethod
                              ? expense.paymentMethod
                                  .replace("_", " ")
                                  .replace(
                                    /\b\w/g,
                                    (char) =>
                                      char.toUpperCase(),
                                  )
                              : "—"}
                          </td>

                          {/* Net */}
                          <td className="whitespace-nowrap px-6 py-4 text-right text-slate-600 dark:text-slate-400">
                            {formatCurrency(
                              expense.netAmount || 0,
                              settings?.currency,
                            )}
                          </td>

                          {/* VAT */}
                          <td className="whitespace-nowrap px-6 py-4 text-right text-slate-600 dark:text-slate-400">
                            {formatCurrency(
                              expense.taxAmount || 0,
                              settings?.currency,
                            )}
                          </td>

                          {/* Total */}
                          <td className="whitespace-nowrap px-6 py-4 text-right font-semibold text-slate-900 dark:text-slate-100">
                            {formatCurrency(
                              expense.amount || 0,
                              settings?.currency,
                            )}
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                status === "posted"
                                  ? "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                                  : status === "cancelled"
                                    ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                                    : "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400"
                              }`}
                            >
                              {status
                                .charAt(0)
                                .toUpperCase() +
                                status.slice(1)}
                            </span>
                          </td>

                          {/* Actions */}
                          {canManageExpenses && (
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                {/* Edit */}
                                {status === "draft" && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      openEditForm(expense)
                                    }
                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                                    aria-label={`Edit ${expense.description}`}
                                  >
                                    <FaEdit className="h-3.5 w-3.5" />
                                  </button>
                                )}

                                {/* Post */}
                                {status === "draft" && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handlePost(expense)
                                    }
                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-green-600 transition hover:bg-green-50 hover:text-green-700 dark:text-green-400 dark:hover:bg-green-950/30"
                                    aria-label={`Post ${expense.description}`}
                                  >
                                    <FaCheck className="h-3.5 w-3.5" />
                                  </button>
                                )}

                                {/* Delete */}
                                {status === "draft" && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDelete(expense)
                                    }
                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/30"
                                    aria-label={`Delete ${expense.description}`}
                                  >
                                    <FaTrash className="h-3.5 w-3.5" />
                                  </button>
                                )}

                                {/* Locked */}
                                {status === "posted" && (
                                  <span className="text-xs text-slate-400">
                                    Locked
                                  </span>
                                )}

                                {/* Cancelled */}
                                {status === "cancelled" && (
                                  <span className="text-xs text-slate-400">
                                    Cancelled
                                  </span>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-slate-200 px-6 py-3 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing {filteredExpenses.length}{" "}
              {filteredExpenses.length === 1
                ? "expense"
                : "expenses"}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Expenses;

