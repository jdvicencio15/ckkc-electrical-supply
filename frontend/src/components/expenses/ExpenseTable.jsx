const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(Number(value || 0));
};

const formatDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getStatusClass = (status) => {
  switch (status) {
    case "posted":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";

    case "cancelled":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";

    default:
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
  }
};

const ExpenseTable = ({
  expenses = [],
  loading = false,
  onEdit,
  onDelete,
  onPost,
}) => {
  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Loading expenses...
        </p>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No expenses found.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">
                Date
              </th>

              <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">
                Description
              </th>

              <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">
                Account
              </th>

              <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">
                Category
              </th>

              <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">
                Payment
              </th>

              <th className="px-4 py-3 text-right font-semibold text-slate-600 dark:text-slate-300">
                Net
              </th>

              <th className="px-4 py-3 text-right font-semibold text-slate-600 dark:text-slate-300">
                VAT
              </th>

              <th className="px-4 py-3 text-right font-semibold text-slate-600 dark:text-slate-300">
                Total
              </th>

              <th className="px-4 py-3 text-center font-semibold text-slate-600 dark:text-slate-300">
                Status
              </th>

              <th className="px-4 py-3 text-right font-semibold text-slate-600 dark:text-slate-300">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {expenses.map((expense) => (
              <tr
                key={expense._id}
                className="transition hover:bg-slate-50 dark:hover:bg-slate-700/30"
              >
                <td className="whitespace-nowrap px-4 py-3 text-slate-700 dark:text-slate-300">
                  {formatDate(expense.expenseDate)}
                </td>

                <td className="max-w-xs px-4 py-3">
                  <div className="font-medium text-slate-800 dark:text-slate-100">
                    {expense.description}
                  </div>

                  {expense.referenceType &&
                    expense.referenceType !== "OTHER" && (
                      <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Ref: {expense.referenceType}
                      </div>
                    )}
                </td>

                <td className="whitespace-nowrap px-4 py-3">
                  <div className="font-medium text-slate-700 dark:text-slate-200">
                    {expense.expenseAccountId?.accountName || "-"}
                  </div>

                  {expense.expenseAccountId?.accountCode && (
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {expense.expenseAccountId.accountCode}
                    </div>
                  )}
                </td>

                <td className="whitespace-nowrap px-4 py-3 text-slate-700 dark:text-slate-300">
                  {expense.category || "-"}
                </td>

                <td className="whitespace-nowrap px-4 py-3 text-slate-700 dark:text-slate-300">
                  {expense.paymentMethod || "-"}
                </td>

                <td className="whitespace-nowrap px-4 py-3 text-right text-slate-700 dark:text-slate-300">
                  {formatCurrency(expense.netAmount)}
                </td>

                <td className="whitespace-nowrap px-4 py-3 text-right text-slate-700 dark:text-slate-300">
                  {formatCurrency(expense.taxAmount)}
                </td>

                <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-slate-800 dark:text-slate-100">
                  {formatCurrency(expense.amount)}
                </td>

                <td className="whitespace-nowrap px-4 py-3 text-center">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${getStatusClass(
                      expense.status,
                    )}`}
                  >
                    {expense.status}
                  </span>
                </td>

                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    {expense.status === "draft" && (
                      <>
                        {onEdit && (
                          <button
                            type="button"
                            onClick={() => onEdit(expense)}
                            className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                          >
                            Edit
                          </button>
                        )}

                        {onPost && (
                          <button
                            type="button"
                            onClick={() => onPost(expense)}
                            className="rounded-lg px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
                          >
                            Post
                          </button>
                        )}

                        {onDelete && (
                          <button
                            type="button"
                            onClick={() => onDelete(expense)}
                            className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                          >
                            Delete
                          </button>
                        )}
                      </>
                    )}

                    {expense.status === "posted" && (
                      <span className="text-xs text-slate-400">
                        Locked
                      </span>
                    )}

                    {expense.status === "cancelled" && (
                      <span className="text-xs text-slate-400">
                        Cancelled
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpenseTable;