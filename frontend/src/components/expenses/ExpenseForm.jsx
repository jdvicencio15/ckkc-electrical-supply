import { useEffect, useState } from "react";

const getLocalDateString = () => {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const INITIAL_FORM = {
  expenseDate: getLocalDateString(),
  category: "OPERATING",
  expenseAccountId: "",
  description: "",
  amount: "",
  pricingMode: "inclusive",
  taxRate: 0,
  paymentMethod: "cash",
  referenceType: "OTHER",
  referenceId: "",
};

const getInitialForm = (settings) => {
  const accountingTax = settings?.accountingTax;

  const vatEnabled = accountingTax?.vatEnabled ?? false;
  const vatRate = Number(accountingTax?.vatRate ?? 0);
  const pricingMode = accountingTax?.pricingMode ?? "inclusive";

  return {
    ...INITIAL_FORM,
    pricingMode: vatEnabled ? pricingMode : "off",
    taxRate: vatEnabled ? vatRate : 0,
  };
};

function ExpenseForm({
  expense = null,
  accounts = [],
  references = [],
  settings = null,
  onSubmit,
  onCancel,
  loading = false,
}) {
  const [formData, setFormData] = useState(() =>
    getInitialForm(settings),
  );

  const [error, setError] = useState("");

  const isEditMode = Boolean(expense);

  const accountingTax = settings?.accountingTax;

  const vatEnabled = accountingTax?.vatEnabled ?? false;

  const configuredVatRate = Number(accountingTax?.vatRate ?? 0);

  const configuredPricingMode =
    accountingTax?.pricingMode ?? "inclusive";

  /*
   * --------------------------------------------------------------------------
   * Reset form for CREATE mode
   * --------------------------------------------------------------------------
   *
   * Settings provide the defaults for a new expense.
   */
  useEffect(() => {
    if (expense) {
      return;
    }

    setFormData(getInitialForm(settings));
    setError("");
  }, [expense, settings]);

  /*
   * --------------------------------------------------------------------------
   * Load existing expense for EDIT mode
   * --------------------------------------------------------------------------
   *
 * Settings are the source of truth for VAT configuration.
 *
 * Existing expense draft values do not override the current
 * VAT settings. Tax mode and tax rate are always taken from
 * the current system configuration.
   */
useEffect(() => {
  if (!expense) {
    return;
  }

  setFormData({
    expenseDate: expense.expenseDate
      ? new Date(expense.expenseDate)
          .toISOString()
          .split("T")[0]
      : "",

    category: expense.category || "OPERATING",

    expenseAccountId:
      expense.expenseAccountId?._id ||
      expense.expenseAccountId ||
      "",

    description: expense.description || "",

    amount: expense.amount ?? "",

    // Settings is the source of truth
    pricingMode: vatEnabled
      ? configuredPricingMode
      : "off",

    taxRate: vatEnabled
      ? configuredVatRate
      : 0,

    paymentMethod: expense.paymentMethod || "cash",

    referenceType: expense.referenceType || "OTHER",

    referenceId: expense.referenceId || "",
  });

  setError("");
}, [
  expense,
  vatEnabled,
  configuredVatRate,
  configuredPricingMode,
]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
  };

  const handleReferenceTypeChange = (event) => {
    const { value } = event.target;

    setFormData((current) => ({
      ...current,
      referenceType: value,
      referenceId:
        value === "OTHER" ? "" : current.referenceId,
    }));

    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!formData.expenseDate) {
      setError("Expense date is required.");
      return;
    }

    if (!formData.expenseAccountId) {
      setError("Please select an expense account.");
      return;
    }

    if (!formData.description.trim()) {
      setError("Description is required.");
      return;
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      setError("Amount must be greater than zero.");
      return;
    }

    if (
      formData.pricingMode !== "off" &&
      (Number(formData.taxRate) < 0 ||
        Number(formData.taxRate) > 100)
    ) {
      setError("Tax rate must be between 0 and 100.");
      return;
    }

    if (
      formData.referenceType !== "OTHER" &&
      !formData.referenceId
    ) {
      setError("Reference ID is required.");
      return;
    }

const payload = {
  expenseDate: formData.expenseDate,
  category: formData.category,
  expenseAccountId: formData.expenseAccountId,
  description: formData.description.trim(),
  amount: Number(formData.amount),

  // VAT configuration comes from Settings
  pricingMode: vatEnabled ? configuredPricingMode : "off",
  taxRate: vatEnabled ? configuredVatRate : 0,

  paymentMethod: formData.paymentMethod,
  referenceType: formData.referenceType,

  ...(formData.referenceType !== "OTHER" && {
    referenceId: formData.referenceId,
  }),
};

    try {
      await onSubmit(payload);
    } catch (submitError) {
      setError(
        submitError?.response?.data?.message ||
          submitError?.message ||
          "Failed to save expense.",
      );
    }
  };

  const selectedReference =
    formData.referenceType !== "OTHER"
      ? references.filter(
          (reference) =>
            reference.type === formData.referenceType,
        )
      : [];

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Basic Information */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label
            htmlFor="expenseDate"
            className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Expense Date
          </label>

          <input
            id="expenseDate"
            name="expenseDate"
            type="date"
            value={formData.expenseDate}
            onChange={handleChange}
            disabled={loading}
            required
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:border-slate-700 dark:bg-slate-900"
          />
        </div>

        <div>
          <label
            htmlFor="category"
            className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Category
          </label>

          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            disabled={loading}
            required
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:border-slate-700 dark:bg-slate-900"
          >
            <option value="DIRECT">Direct</option>
            <option value="OPERATING">Operating</option>
          </select>
        </div>
      </div>

      {/* Expense Account */}
      <div>
        <label
          htmlFor="expenseAccountId"
          className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Expense Account
        </label>

        <select
          id="expenseAccountId"
          name="expenseAccountId"
          value={formData.expenseAccountId}
          onChange={handleChange}
          disabled={loading}
          required
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:border-slate-700 dark:bg-slate-900"
        >
          <option value="">
            Select expense account
          </option>

          {accounts.map((account) => (
            <option
              key={account._id}
              value={account._id}
            >
              {account.accountCode} -{" "}
              {account.accountName}
            </option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Description
        </label>

        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          disabled={loading}
          required
          maxLength={500}
          rows={3}
          placeholder="Enter expense description"
          className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:border-slate-700 dark:bg-slate-900"
        />
      </div>

      {/* Amount / Tax */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label
            htmlFor="amount"
            className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Amount
          </label>

          <input
            id="amount"
            name="amount"
            type="number"
            min="0.01"
            step="0.01"
            value={formData.amount}
            onChange={handleChange}
            disabled={loading}
            required
            placeholder="0.00"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:border-slate-700 dark:bg-slate-900"
          />
        </div>

       <div>
  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
    Tax Mode
  </label>

  <input
    type="text"
    value={
      vatEnabled
        ? configuredPricingMode === "inclusive"
          ? "VAT Inclusive"
          : "VAT Exclusive"
        : "VAT Off"
    }
    disabled
    readOnly
    className="w-full cursor-not-allowed rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
  />
        </div>

      <div>
  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
    Tax Rate (%)
  </label>

  <input
    type="number"
    value={vatEnabled ? configuredVatRate : 0}
    disabled
    readOnly
    className="w-full cursor-not-allowed rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
  />
</div>
      </div>

      {/* Payment */}
      <div>
        <label
          htmlFor="paymentMethod"
          className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Payment Method
        </label>

        <select
          id="paymentMethod"
          name="paymentMethod"
          value={formData.paymentMethod}
          onChange={handleChange}
          disabled={loading}
          required
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:border-slate-700 dark:bg-slate-900"
        >
          <option value="cash">Cash</option>
          <option value="bank_transfer">
            Bank Transfer
          </option>
          <option value="gcash">GCash</option>
          <option value="maya">Maya</option>
          <option value="check">Check</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Reference */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label
            htmlFor="referenceType"
            className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Reference Type
          </label>

          <select
            id="referenceType"
            name="referenceType"
            value={formData.referenceType}
            onChange={handleReferenceTypeChange}
            disabled={loading}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:border-slate-700 dark:bg-slate-900"
          >
            <option value="OTHER">Other</option>
            <option value="SALE">Sale</option>
            <option value="CLIENT_PO">
              Client PO
            </option>
          </select>
        </div>

        {formData.referenceType !== "OTHER" && (
          <div>
            <label
              htmlFor="referenceId"
              className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Reference
            </label>

            <select
              id="referenceId"
              name="referenceId"
              value={formData.referenceId}
              onChange={handleChange}
              disabled={loading}
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:border-slate-700 dark:bg-slate-900"
            >
              <option value="">
                Select reference
              </option>

              {selectedReference.map((reference) => (
                <option
                  key={reference._id}
                  value={reference._id}
                >
                  {reference.label ||
                    reference.number ||
                    reference._id}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-700">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Saving..."
            : isEditMode
              ? "Update Expense"
              : "Save Expense"}
        </button>
      </div>
    </form>
  );
}

export default ExpenseForm;