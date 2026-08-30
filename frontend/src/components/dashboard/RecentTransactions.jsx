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

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-gray-900">
          Recent Transactions
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Latest sales activity
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] text-left">
          <thead>
            <tr className="border-b border-gray-200 text-xs uppercase text-gray-500">
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
                className="border-b border-gray-100 last:border-0"
              >
                <td className="py-4 text-sm font-medium text-gray-900">
                  {transaction.reference}
                </td>

                <td className="py-4 text-sm text-gray-600">
                  {transaction.customer}
                </td>

                <td className="py-4 text-sm font-medium text-gray-900">
                  {transaction.amount}
                </td>

                <td className="py-4 text-right">
                  <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
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