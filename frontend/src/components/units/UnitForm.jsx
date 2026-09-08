
import { useEffect, useState } from "react";

function UnitForm({
  unit,
  onSubmit,
  onCancel,
  submitting = false,
}) {
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    status: "active",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (unit) {
      setFormData({
        code: unit.code || "",
        name: unit.name || "",
        description: unit.description || "",
        status: unit.status || "active",
      });
    } else {
      setFormData({
        code: "",
        name: "",
        description: "",
        status: "active",
      });
    }

    setErrors({});
  }, [unit]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.code.trim()) {
      newErrors.code = "Unit code is required.";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Unit name is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    await onSubmit({
      code: formData.code.trim(),
      name: formData.name.trim(),
      description: formData.description.trim(),
      status: formData.status,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        {/* Code */}
        <div>
          <label
            htmlFor="code"
            className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Unit Code
          </label>

          <input
            id="code"
            name="code"
            type="text"
            value={formData.code}
            onChange={handleChange}
            placeholder="e.g. PC, KG, M"
            disabled={submitting}
            maxLength={20}
            className={`w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-500 dark:bg-slate-800 dark:text-slate-100 ${
              errors.code
                ? "border-red-400 focus:border-red-500"
                : "border-slate-200 dark:border-slate-700"
            }`}
          />

          {errors.code && (
            <p className="mt-1.5 text-xs text-red-500">
              {errors.code}
            </p>
          )}
        </div>

        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Unit Name
          </label>

          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Piece, Kilogram, Meter"
            disabled={submitting}
            maxLength={100}
            className={`w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-500 dark:bg-slate-800 dark:text-slate-100 ${
              errors.name
                ? "border-red-400 focus:border-red-500"
                : "border-slate-200 dark:border-slate-700"
            }`}
          />

          {errors.name && (
            <p className="mt-1.5 text-xs text-red-500">
              {errors.name}
            </p>
          )}
        </div>
      </div>

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
          placeholder="Optional description"
          disabled={submitting}
          rows={3}
          className="w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
      </div>

      {/* Status */}
      <div>
        <label
          htmlFor="status"
          className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Status
        </label>

        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          disabled={submitting}
          className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 border-t border-slate-200 pt-5 dark:border-slate-800">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting
            ? "Saving..."
            : unit
              ? "Update Unit"
              : "Create Unit"}
        </button>
      </div>
    </form>
  );
}

export default UnitForm;

