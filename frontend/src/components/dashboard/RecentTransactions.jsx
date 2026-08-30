function RecentTransactions() {
  const transactions = [
    {
      id: 1,
      reference: "SALE-0001",
      customer: "Walk-in Customer",
      amount: "₱0.00",
      status: "Completed",
    },
    {
      id: 2,
      reference: "SALE-0002",
      customer: "Sample Customer",
      amount: "₱0.00",
      status: "Pending",
    },
    {
      id: 3,
      reference: "SALE-0003",
      customer: "Sample Customer",
      amount: "₱0.00",
      status: "Completed",
    },
  ];

  const statusStyles = {
    Completed: "bg-green-50 text-green-700",
    Pending: "bg-amber-50 text-amber-700",
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Recent Transactions
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Latest sales activity
          </p>
        </div>

        <button
          type="button"
          className="shrink-0 text-xs font-semibold text-green-600 transition hover:text-green-700"
        >
          View All
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] text-left">
          <thead>
            <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <th className="pb-3 font-medium">
                Reference
              </th>

              <th className="pb-3 font-medium">
                Customer
              </th>

              <th className="pb-3 font-medium">
                Amount
              </th>

              <th className="pb-3 text-right font-medium">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {transactions.map((transaction) => (
              <tr
                key={transaction.id}
                className="border-b border-slate-100 last:border-0"
              >
                <td className="py-4 text-sm font-medium text-slate-900">
                  {transaction.reference}
                </td>

                <td className="py-4 text-sm text-slate-600">
                  {transaction.customer}
                </td>

                <td className="py-4 text-sm font-medium text-slate-900">
                  {transaction.amount}
                </td>

                <td className="py-4 text-right">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      statusStyles[transaction.status] ||
                      "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {transaction.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RecentTransactions;