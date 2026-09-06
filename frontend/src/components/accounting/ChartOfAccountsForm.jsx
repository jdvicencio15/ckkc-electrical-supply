
import { useEffect, useMemo, useState } from "react";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Button from "../ui/Button";
import Modal from "../ui/Modal";

const accountTypeOptions = [
  {
    value: "asset",
    label: "Asset",
  },
  {
    value: "liability",
    label: "Liability",
  },
  {
    value: "equity",
    label: "Equity",
  },
  {
    value: "revenue",
    label: "Revenue",
  },
  {
    value: "expense",
    label: "Expense",
  },
];

function ChartOfAccountsForm({
  account,
  accounts = [],
  onSubmit,
  onClose,
  submitting = false,
}) {
  const isEditing = Boolean(account);

  const [formData, setFormData] = useState({
    accountCode: "",
    accountName: "",
    accountType: "",
    parentAccount: "",
    description: "",
    isActive: true,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (account) {
      setFormData({
        accountCode: account.accountCode || "",
        accountName: account.accountName || "",
        accountType: account.accountType || "",
        parentAccount:
          account.parentAccount?._id ||
          account.parentAccount ||
          "",
        description: account.description || "",
        isActive: account.isActive ?? true,
      });
    } else {
      setFormData({
        accountCode: "",
        accountName: "",
        accountType: "",
        parentAccount: "",
        description: "",
        isActive: true,
      });
    }

    setErrors({});
  }, [account]);

  const parentAccountOptions = useMemo(() => {
    return accounts
      .filter((item) => {
        if (account && item._id === account._id) {
          return false;
        }

        return item.isActive;
      })
      .sort((a, b) =>
        a.accountCode.localeCompare(b.accountCode)
      )
      .map((item) => ({
        value: item._id,
        label: `${item.accountCode} - ${item.accountName}`,
      }));
  }, [accounts, account]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = {};

    if (!formData.accountCode.trim()) {
      validationErrors.accountCode =
        "Account code is required.";
    }

    if (!formData.accountName.trim()) {
      validationErrors.accountName =
        "Account name is required.";
    }

    if (!formData.accountType) {
      validationErrors.accountType =
        "Account type is required.";
    }

    if (formData.accountCode.length > 20) {
      validationErrors.accountCode =
        "Account code must not exceed 20 characters.";
    }

    if (formData.accountName.length > 100) {
      validationErrors.accountName =
        "Account name must not exceed 100 characters.";
    }

    if (formData.description.length > 500) {
      validationErrors.description =
        "Description must not exceed 500 characters.";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload = {
      accountCode: formData.accountCode.trim(),
      accountName: formData.accountName.trim(),
      accountType: formData.accountType,
      parentAccount:
        formData.parentAccount || null,
      description:
        formData.description.trim() || undefined,
      isActive: formData.isActive,
    };

    await onSubmit(payload);
  };

  return (
    <Modal
      isOpen={true}
      onClose={submitting ? undefined : onClose}
      title={isEditing ? "Edit Account" : "Add Account"}
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        {/* Account Code */}
        <Input
          label="Account Code"
          name="accountCode"
          value={formData.accountCode}
          onChange={handleChange}
          placeholder="e.g. 1000"
          required
          disabled={submitting}
          error={errors.accountCode}
        />

        {/* Account Name */}
        <Input
          label="Account Name"
          name="accountName"
          value={formData.accountName}
          onChange={handleChange}
          placeholder="e.g. Cash"
          required
          disabled={submitting}
          error={errors.accountName}
        />

        {/* Account Type */}
        <Select
          label="Account Type"
          name="accountType"
          value={formData.accountType}
          onChange={handleChange}
          options={accountTypeOptions}
          placeholder="Select account type"
          disabled={submitting}
          error={errors.accountType}
        />

        {/* Parent Account */}
        <Select
          label="Parent Account"
          name="parentAccount"
          value={formData.parentAccount}
          onChange={handleChange}
          options={parentAccountOptions}
          placeholder="No parent account"
          disabled={submitting}
          error={errors.parentAccount}
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
            placeholder="Optional account description"
            disabled={submitting}
            rows={4}
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

        {/* Status */}
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={(e) =>
              setFormData((previous) => ({
                ...previous,
                isActive: e.target.checked,
              }))
            }
            disabled={submitting}
            className="h-4 w-4 rounded border-slate-300 text-green-600 focus:ring-green-500 dark:border-slate-600 dark:bg-slate-800"
          />

          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Active Account
          </span>
        </label>

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
            {isEditing ? "Update Account" : "Save Account"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default ChartOfAccountsForm;

