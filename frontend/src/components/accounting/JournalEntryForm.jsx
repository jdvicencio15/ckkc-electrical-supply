import { useEffect, useMemo, useState } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import { useSettings } from "../../context/SettingsContext";
import { formatCurrency } from "../../utils/currency";

const createEmptyLine = () => ({
  account: "",
  debit: "",
  credit: "",
});

function JournalEntryForm({
  journalEntry,
  accounts = [],
  onSubmit,
  onClose,
  submitting = false,
}) {

  const { settings } = useSettings();

  const isEditing = Boolean(journalEntry);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    reference: "",
    description: "",
    entries: [createEmptyLine(), createEmptyLine()],
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (journalEntry) {
      setFormData({
        date: journalEntry.date
          ? new Date(journalEntry.date)
              .toISOString()
              .split("T")[0]
          : new Date().toISOString().split("T")[0],

        reference: journalEntry.reference || "",

        description: journalEntry.description || "",

        entries:
          journalEntry.entries?.length >= 2
            ? journalEntry.entries.map((line) => ({
                account:
                  line.account?._id ||
                  line.account ||
                  "",
                debit:
                  line.debit !== undefined &&
                  line.debit !== null
                    ? String(line.debit)
                    : "",
                credit:
                  line.credit !== undefined &&
                  line.credit !== null
                    ? String(line.credit)
                    : "",
              }))
            : [createEmptyLine(), createEmptyLine()],
      });
    } else {
      setFormData({
        date: new Date().toISOString().split("T")[0],
        reference: "",
        description: "",
        entries: [createEmptyLine(), createEmptyLine()],
      });
    }

    setErrors({});
  }, [journalEntry]);

  const accountOptions = useMemo(() => {
    return accounts
      .filter((account) => account.isActive)
      .sort((a, b) =>
        a.accountCode.localeCompare(b.accountCode)
      )
      .map((account) => ({
        value: account._id,
        label: `${account.accountCode} - ${account.accountName}`,
      }));
  }, [accounts]);

  const totalDebit = useMemo(() => {
    return formData.entries.reduce(
      (total, line) =>
        total + Number(line.debit || 0),
      0
    );
  }, [formData.entries]);

  const totalCredit = useMemo(() => {
    return formData.entries.reduce(
      (total, line) =>
        total + Number(line.credit || 0),
      0
    );
  }, [formData.entries]);

  const isBalanced =
    totalDebit > 0 &&
    totalCredit > 0 &&
    Math.abs(totalDebit - totalCredit) <= 0.01;


  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((previous) => ({
        ...previous,
        [name]: "",
      }));
    }
  };

  const handleLineChange = (index, field, value) => {
    setFormData((previous) => {
      const updatedEntries = [...previous.entries];

      updatedEntries[index] = {
        ...updatedEntries[index],
        [field]: value,
      };

      // A journal line cannot have both debit and credit.
      if (field === "debit" && Number(value) > 0) {
        updatedEntries[index].credit = "";
      }

      if (field === "credit" && Number(value) > 0) {
        updatedEntries[index].debit = "";
      }

      return {
        ...previous,
        entries: updatedEntries,
      };
    });

    if (errors[`entry_${index}`]) {
      setErrors((previous) => ({
        ...previous,
        [`entry_${index}`]: "",
      }));
    }
  };

  const handleAddLine = () => {
    setFormData((previous) => ({
      ...previous,
      entries: [
        ...previous.entries,
        createEmptyLine(),
      ],
    }));
  };

  const handleRemoveLine = (index) => {
    if (formData.entries.length <= 2) {
      return;
    }

    setFormData((previous) => ({
      ...previous,
      entries: previous.entries.filter(
        (_, lineIndex) => lineIndex !== index
      ),
    }));

    setErrors((previous) => {
      const updatedErrors = { ...previous };
      delete updatedErrors[`entry_${index}`];
      return updatedErrors;
    });
  };

  const validateForm = () => {
    const validationErrors = {};

    if (!formData.date) {
      validationErrors.date =
        "Journal entry date is required.";
    }

    if (formData.reference.length > 100) {
      validationErrors.reference =
        "Reference must not exceed 100 characters.";
    }

    if (!formData.description.trim()) {
      validationErrors.description =
        "Description is required.";
    }

    if (formData.description.length > 500) {
      validationErrors.description =
        "Description must not exceed 500 characters.";
    }

    if (formData.entries.length < 2) {
      validationErrors.entries =
        "Journal entry must contain at least two lines.";
    }

    formData.entries.forEach((line, index) => {
      const debit = Number(line.debit || 0);
      const credit = Number(line.credit || 0);

      if (!line.account) {
        validationErrors[`entry_${index}`] =
          "Account is required.";
        return;
      }

      if (debit < 0 || credit < 0) {
        validationErrors[`entry_${index}`] =
          "Amounts cannot be negative.";
        return;
      }

      if (debit > 0 && credit > 0) {
        validationErrors[`entry_${index}`] =
          "A line cannot have both debit and credit.";
        return;
      }

      if (debit === 0 && credit === 0) {
        validationErrors[`entry_${index}`] =
          "Enter a debit or credit amount.";
      }
    });

    if (totalDebit <= 0 || totalCredit <= 0) {
      validationErrors.entries =
        "Journal entry must contain both debit and credit amounts.";
    } else if (
      Math.abs(totalDebit - totalCredit) > 0.01
    ) {
      validationErrors.entries =
        "Total debit and total credit must be equal.";
    }

    setErrors(validationErrors);

    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const payload = {
      date: formData.date,
      reference:
        formData.reference.trim() || undefined,
      description: formData.description.trim(),
      entries: formData.entries.map((line) => ({
        account: line.account,
        debit: Number(line.debit || 0),
        credit: Number(line.credit || 0),
      })),
    };

    await onSubmit(payload);
  };

  return (
    <Modal
      isOpen={true}
      onClose={submitting ? undefined : onClose}
      title={
        isEditing
          ? "Edit Journal Entry"
          : "Add Journal Entry"
      }
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        {/* Date */}
        <Input
          label="Date"
          name="date"
          type="date"
          value={formData.date}
          onChange={handleChange}
          required
          disabled={submitting}
          error={errors.date}
        />

        {/* Reference */}
        <Input
          label="Reference"
          name="reference"
          value={formData.reference}
          onChange={handleChange}
          placeholder="e.g. JE-0001"
          disabled={submitting}
          error={errors.reference}
        />

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Description
          </label>

          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter journal entry description"
            disabled={submitting}
            rows={3}
            maxLength={500}
            className={`w-full rounded-lg border bg-white px-4 py-2.5 text-base text-slate-900 outline-none transition
              placeholder:text-slate-400
              focus:border-green-500 focus:ring-2 focus:ring-green-100
              disabled:cursor-not-allowed disabled:bg-slate-100
              dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100
              dark:placeholder:text-slate-500
              dark:focus:border-green-500 dark:focus:ring-green-950
              dark:disabled:bg-slate-800
              ${
                errors.description
                  ? "border-red-500 focus:border-red-500 focus:ring-red-100 dark:border-red-500 dark:focus:ring-red-950"
                  : "border-slate-300"
              }`}
          />

          {errors.description && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.description}
            </p>
          )}
        </div>

        {/* Journal Lines */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Journal Lines
              </h3>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Enter the debit and credit amounts for each account.
              </p>
            </div>

            <Button
              type="button"
              variant="secondary"
              onClick={handleAddLine}
              disabled={submitting}
            >
              <FaPlus className="mr-2 h-3 w-3" />
              Add Line
            </Button>
          </div>

          {errors.entries && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
              {errors.entries}
            </div>
          )}

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full min-w-[700px] text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                    Account
                  </th>

                  <th className="w-40 px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                    Debit
                  </th>

                  <th className="w-40 px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                    Credit
                  </th>

                  <th className="w-12 px-2 py-3"></th>
                </tr>
              </thead>

              <tbody>
                {formData.entries.map(
                  (line, index) => (
                    <tr
                      key={index}
                      className="border-t border-slate-100 dark:border-slate-800"
                    >
                      {/* Account */}
                      <td className="px-4 py-3 align-top">
                        <Select
                          name={`account_${index}`}
                          value={line.account}
                          onChange={(e) =>
                            handleLineChange(
                              index,
                              "account",
                              e.target.value
                            )
                          }
                          options={accountOptions}
                          placeholder="Select account"
                          disabled={submitting}
                        />
                      </td>

                      {/* Debit */}
                      <td className="px-4 py-3 align-top">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={line.debit}
                          onChange={(e) =>
                            handleLineChange(
                              index,
                              "debit",
                              e.target.value
                            )
                          }
                          placeholder="0.00"
                          disabled={submitting}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-right text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-green-500 dark:focus:ring-green-950 dark:disabled:bg-slate-800"
                        />
                      </td>

                      {/* Credit */}
                      <td className="px-4 py-3 align-top">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={line.credit}
                          onChange={(e) =>
                            handleLineChange(
                              index,
                              "credit",
                              e.target.value
                            )
                          }
                          placeholder="0.00"
                          disabled={submitting}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-right text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-green-500 dark:focus:ring-green-950 dark:disabled:bg-slate-800"
                        />
                      </td>

                      {/* Remove */}
                      <td className="px-2 py-3 align-top text-center">
                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveLine(index)
                          }
                          disabled={
                            submitting ||
                            formData.entries.length <= 2
                          }
                          className="mt-1 flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-30 dark:text-red-400 dark:hover:bg-red-950/30"
                          aria-label="Remove journal line"
                        >
                          <FaTrash className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* Line Errors */}
          {formData.entries.map(
            (_, index) =>
              errors[`entry_${index}`] && (
                <p
                  key={index}
                  className="text-sm text-red-600 dark:text-red-400"
                >
                  Line {index + 1}:{" "}
                  {errors[`entry_${index}`]}
                </p>
              )
          )}
        </div>

        {/* Totals */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                Total Debit
              </p>

              <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
               {formatCurrency(totalDebit, settings?.currency)}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                Total Credit
              </p>

              <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
                {formatCurrency(totalCredit, settings?.currency)}
              </p>
            </div>
          </div>

          <div className="mt-4 border-t border-slate-200 pt-3 dark:border-slate-700">
            <div
              className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${
                isBalanced
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
              }`}
            >
              {isBalanced
                ? "✓ Balanced"
                : "⚠ Unbalanced"}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 border-t border-slate-200 pt-5 dark:border-slate-800">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            loading={submitting}
          >
            {isEditing
              ? "Update Entry"
              : "Save Entry"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default JournalEntryForm;