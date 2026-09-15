function ExpenseFilters({
  search = "",
  status = "all",
  category = "all",
  dateFrom = "",
  dateTo = "",
  onSearchChange,
  onStatusChange,
  onCategoryChange,
  onDateFromChange,
  onDateToChange,
  onReset,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        {/* Search */}
        <div className="lg:col-span-2">
          <label
            htmlFor="expense-search"
            className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Search
          </label>

          <input
            id="expense-search"
            type="text"
            value={search}
            onChange={(event) =>
              onSearchChange?.(event.target.value)
            }
            placeholder="Search description, account..."
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          />
        </div>

        {/* Status */}
        <div>
          <label
            htmlFor="expense-status"
            className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Status
          </label>

          <select
            id="expense-status"
            value={status}
            onChange={(event) =>
              onStatusChange?.(event.target.value)
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="posted">Posted</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Category */}
        <div>
          <label
            htmlFor="expense-category"
            className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Category
          </label>

          <select
            id="expense-category"
            value={category}
            onChange={(event) =>
              onCategoryChange?.(event.target.value)
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          >
            <option value="all">All Categories</option>
            <option value="DIRECT">Direct</option>
            <option value="OPERATING">Operating</option>
          </select>
        </div>

        {/* Date From */}
        <div>
          <label
            htmlFor="expense-date-from"
            className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            From
          </label>

          <input
            id="expense-date-from"
            type="date"
            value={dateFrom}
            onChange={(event) =>
              onDateFromChange?.(event.target.value)
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          />
        </div>

        {/* Date To */}
        <div>
          <label
            htmlFor="expense-date-to"
            className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            To
          </label>

          <input
            id="expense-date-to"
            type="date"
            value={dateTo}
            min={dateFrom || undefined}
            onChange={(event) =>
              onDateToChange?.(event.target.value)
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          />
        </div>
      </div>

      {/* Reset */}
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={onReset}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
}

export default ExpenseFilters;