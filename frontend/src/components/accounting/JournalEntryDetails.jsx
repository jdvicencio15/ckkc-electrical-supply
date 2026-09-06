import Modal from "../ui/Modal";

function JournalEntryDetails({
  journalEntry,
  onClose,
}) {
  if (!journalEntry) {
    return null;
  }

  const entries = journalEntry.entries || [];

  const totalDebit = entries.reduce(
    (total, line) =>
      total + Number(line.debit || 0),
    0
  );

  const totalCredit = entries.reduce(
    (total, line) =>
      total + Number(line.credit || 0),
    0
  );

  const isBalanced =
    totalDebit > 0 &&
    totalCredit > 0 &&
    Math.abs(totalDebit - totalCredit) <= 0.01;

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleDateString(
      "en-PH",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Journal Entry Details"
      size="2xl"
    >
      <div className="space-y-5">
        {/* Header Information */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
              Date
            </p>

            <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">
              {formatDate(journalEntry.date)}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
              Reference
            </p>

            <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">
              {journalEntry.reference || "—"}
            </p>
          </div>
        </div>

        {/* Description */}
        <div>
          <p className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
            Description
          </p>

          <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
            {journalEntry.description || "—"}
          </p>
        </div>

        {/* Journal Lines */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
            Journal Lines
          </h3>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full min-w-[600px] text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                    Account
                  </th>

                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                    Debit
                  </th>

                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                    Credit
                  </th>
                </tr>
              </thead>

              <tbody>
                {entries.map((line, index) => (
                  <tr
                    key={index}
                    className="border-t border-slate-100 dark:border-slate-800"
                  >
                    <td className="px-4 py-3">
                      {line.account ? (
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-100">
                            {line.account.accountName ||
                              "Unknown Account"}
                          </p>

                          {line.account.accountCode && (
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                              {line.account.accountCode}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400">
                          Unknown Account
                        </span>
                      )}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-right text-slate-700 dark:text-slate-300">
                      {Number(line.debit || 0) > 0
                        ? formatAmount(line.debit)
                        : "—"}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-right text-slate-700 dark:text-slate-300">
                      {Number(line.credit || 0) > 0
                        ? formatAmount(line.credit)
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>

              {/* Totals */}
              <tfoot className="border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
                <tr>
                  <td className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-300">
                    Total
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-slate-900 dark:text-slate-100">
                    {formatAmount(totalDebit)}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-slate-900 dark:text-slate-100">
                    {formatAmount(totalCredit)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Balance Status */}
        <div
          className={`rounded-xl border px-4 py-3 ${
            isBalanced
              ? "border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-950/20"
              : "border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className={`text-sm font-semibold ${
                  isBalanced
                    ? "text-green-700 dark:text-green-400"
                    : "text-amber-700 dark:text-amber-400"
                }`}
              >
                {isBalanced
                  ? "✓ Balanced Journal Entry"
                  : "⚠ Unbalanced Journal Entry"}
              </p>

              <p
                className={`mt-1 text-xs ${
                  isBalanced
                    ? "text-green-600 dark:text-green-400"
                    : "text-amber-600 dark:text-amber-400"
                }`}
              >
                {isBalanced
                  ? "Total debit and credit amounts are equal."
                  : "Total debit and credit amounts are not equal."}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end border-t border-slate-200 pt-5 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default JournalEntryDetails;