import { FaEdit, FaTrash, FaEye } from "react-icons/fa";

import { useSettings } from "../../context/SettingsContext";
import { formatCurrency } from "../../utils/currency";

function JournalEntryTable({
  journalEntries = [],
  loading = false,
  onEdit,
  onDelete,
  onView,
}) {
  const { settings } = useSettings();
  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getTotalDebit = (entries = []) => {
    return entries.reduce((total, line) => total + Number(line.debit || 0), 0);
  };

  const getTotalCredit = (entries = []) => {
    return entries.reduce((total, line) => total + Number(line.credit || 0), 0);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
            <tr>
              <th className="px-6 py-3 font-semibold">Date</th>

              <th className="px-6 py-3 font-semibold">Reference</th>

              <th className="px-6 py-3 font-semibold">Description</th>

              <th className="px-6 py-3 font-semibold">Lines</th>

              <th className="px-6 py-3 text-right font-semibold">Debit</th>

              <th className="px-6 py-3 text-right font-semibold">Credit</th>

              <th className="px-6 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="7"
                  className="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400"
                >
                  Loading journal entries...
                </td>
              </tr>
            ) : journalEntries.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400"
                >
                  No journal entries found.
                </td>
              </tr>
            ) : (
              journalEntries.map((journalEntry) => {
                const totalDebit = getTotalDebit(journalEntry.entries);

                const totalCredit = getTotalCredit(journalEntry.entries);

                return (
                  <tr
                    key={journalEntry._id}
                    className="border-t border-slate-100 dark:border-slate-800"
                  >
                    {/* Date */}
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="text-slate-700 dark:text-slate-300">
                        {formatDate(journalEntry.date)}
                      </span>
                    </td>

                    {/* Reference */}
                    <td className="px-6 py-4">
                      {journalEntry.reference ? (
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {journalEntry.reference}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* Description */}
                    <td className="max-w-sm px-6 py-4">
                      <p
                        className="truncate text-slate-700 dark:text-slate-300"
                        title={journalEntry.description}
                      >
                        {journalEntry.description}
                      </p>
                    </td>

                    {/* Lines */}
                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        {journalEntry.entries?.length || 0}{" "}
                        {journalEntry.entries?.length === 1 ? "line" : "lines"}
                      </span>
                    </td>

                    {/* Debit */}
                    <td className="whitespace-nowrap px-6 py-4 text-right font-medium text-slate-900 dark:text-slate-100">
                      {formatCurrency(totalDebit, settings?.currency)}
                    </td>

                    {/* Credit */}
                    <td className="whitespace-nowrap px-6 py-4 text-right font-medium text-slate-900 dark:text-slate-100">
                      {formatCurrency(totalCredit, settings?.currency)}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {/* View */}
                        <button
                          type="button"
                          onClick={() => onView?.(journalEntry)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                          aria-label={`View ${
                            journalEntry.reference || "journal entry"
                          }`}
                        >
                          <FaEye className="h-3.5 w-3.5" />
                        </button>

                        {/* Edit */}
                        <button
                          type="button"
                          onClick={() => onEdit?.(journalEntry)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                          aria-label={`Edit ${
                            journalEntry.reference || "journal entry"
                          }`}
                        >
                          <FaEdit className="h-3.5 w-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => onDelete?.(journalEntry)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/30"
                          aria-label={`Delete ${
                            journalEntry.reference || "journal entry"
                          }`}
                        >
                          <FaTrash className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 px-6 py-3 dark:border-slate-800">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Showing {journalEntries.length}{" "}
          {journalEntries.length === 1 ? "journal entry" : "journal entries"}
        </p>
      </div>
    </div>
  );
}

export default JournalEntryTable;
