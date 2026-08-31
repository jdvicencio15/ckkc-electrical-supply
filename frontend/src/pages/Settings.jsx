function Settings() {
  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Settings
        </h1>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage your system preferences and business settings.
        </p>
      </div>

      {/* General Settings */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

        <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            General Settings
          </h2>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Configure basic system information.
          </p>
        </div>

        <div className="grid gap-5 p-6 md:grid-cols-2">

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Business Name
            </label>

            <input
              type="text"
              placeholder="Enter business name"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Business Email
            </label>

            <input
              type="email"
              placeholder="Enter business email"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Contact Number
            </label>

            <input
              type="text"
              placeholder="Enter contact number"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Currency
            </label>

            <select
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              <option>PHP — Philippine Peso</option>
              <option>USD — US Dollar</option>
            </select>
          </div>

        </div>

        <div className="border-t border-slate-200 px-6 py-4 dark:border-slate-800">
          <button
            type="button"
            className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
          >
            Save Changes
          </button>
        </div>

      </div>

      {/* System Preferences */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

        <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            System Preferences
          </h2>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Configure how the system behaves.
          </p>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">

          <div className="flex items-center justify-between px-6 py-6">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Low Stock Notifications
              </p>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Receive alerts when products reach their reorder level.
              </p>
            </div>

            <input
              type="checkbox"
              defaultChecked
              className="h-4 w-4 accent-green-600"
            />
          </div>

        <div className="flex items-center justify-between px-6 py-6">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Invoice Notifications
              </p>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Receive notifications for invoice activity.
              </p>
            </div>

            <input
              type="checkbox"
              defaultChecked
              className="h-4 w-4 accent-green-600"
            />
          </div>

        </div>

      </div>

      {/* Danger Zone */}
      <div className="rounded-xl border border-red-200 bg-white shadow-sm dark:border-red-900/50 dark:bg-slate-900">

        <div className="border-b border-red-100 px-6 py-4 dark:border-red-900/40">
          <h2 className="text-sm font-semibold text-red-600 dark:text-red-400">
            Danger Zone
          </h2>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Actions in this section may affect your system configuration.
          </p>
        </div>

       <div className="flex items-center justify-between px-6 py-6">
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
              Reset System Settings
            </p>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Restore system preferences to their default values.
            </p>
          </div>

          <button
            type="button"
            className="rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
          >
            Reset Settings
          </button>
        </div>

      </div>

    </div>
  );
}

export default Settings;