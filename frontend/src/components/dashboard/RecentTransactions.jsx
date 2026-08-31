import { useNavigate } from "react-router-dom";

function RecentTransactions({ sales }) {
  const navigate = useNavigate();

  const transactions = sales
    .slice()
    .sort((a, b) => new Date(b.saleDate) - new Date(a.saleDate))
    .slice(0, 5);

  const statusStyles = {
    released: "bg-green-50 text-green-700",
    pending: "bg-amber-50 text-amber-700",
    cancelled: "bg-red-50 text-red-700",
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Recent Transactions
          </h2>

          <p className="mt-1 text-sm text-slate-500">Latest sales activity</p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/sales")}
          className="shrink-0 text-xs font-semibold text-green-600 transition hover:text-green-700"
        >
          View All
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] text-left">
          <thead>
            <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <th className="pb-3 font-medium">Reference</th>

              <th className="pb-3 font-medium">Customer</th>

              <th className="pb-3 font-medium">Amount</th>

              <th className="pb-3 text-right font-medium">Status</th>
            </tr>
          </thead>

          <tbody>
            {transactions.length > 0 ? (
              transactions.map((transaction) => (
                <tr
                  key={transaction._id}
                  className="border-b border-slate-100 last:border-0"
                >
                  <td className="py-4 text-sm font-medium text-slate-900">
                    {transaction.salesNumber}
                  </td>

                  <td className="py-4 text-sm text-slate-600">
                    {transaction.customerId?.name || "Unknown Customer"}
                  </td>

                  <td className="py-4 text-sm font-medium text-slate-900">
                    ₱
                    {(transaction.totalAmount || 0).toLocaleString("en-PH", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
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
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="py-8 text-center text-sm text-slate-500"
                >
                  No transactions found for this month.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RecentTransactions;
