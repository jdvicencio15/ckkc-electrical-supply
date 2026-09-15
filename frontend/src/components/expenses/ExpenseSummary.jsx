function ExpenseSummary({ expenses = [] }) {
  const roundMoney = (value) => {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  };

  const formatAmount = (amount) => {
    return Number(amount || 0).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const totalExpenses = expenses.reduce(
    (total, expense) =>
      total + Number(expense.amount || 0),
    0,
  );

  const netExpenses = expenses.reduce(
    (total, expense) =>
      total + Number(expense.netAmount || 0),
    0,
  );

  const inputVat = expenses.reduce(
    (total, expense) =>
      total + Number(expense.taxAmount || 0),
    0,
  );

  const postedExpenses = expenses
    .filter((expense) => expense.status === "posted")
    .reduce(
      (total, expense) =>
        total + Number(expense.amount || 0),
      0,
    );

  const draftExpenses = expenses
    .filter((expense) => expense.status === "draft")
    .reduce(
      (total, expense) =>
        total + Number(expense.amount || 0),
      0,
    );

  const cards = [
    {
      label: "Total Expenses",
      value: totalExpenses,
    },
    {
      label: "Net Expenses",
      value: netExpenses,
    },
    {
      label: "Input VAT",
      value: inputVat,
    },
    {
      label: "Posted",
      value: postedExpenses,
    },
    {
      label: "Draft",
      value: draftExpenses,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
        >
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {card.label}
          </p>

          <p className="mt-2 text-xl font-bold text-slate-800 dark:text-slate-100">
            {formatAmount(roundMoney(card.value))}
          </p>
        </div>
      ))}
    </div>
  );
}

export default ExpenseSummary;