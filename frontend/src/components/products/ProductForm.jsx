
import { useEffect, useState } from "react";

const initialForm = {
  sku: "",
  name: "",
  description: "",
  categoryId: "",
  unitId: "",
  unit: "",
  minimumStock: 0,
  status: "active",
};

function ProductForm({
  categories,
  units,
  product,
  onSubmit,
  onCancel,
  submitting,
}) {
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    if (product) {
      setFormData({
        sku: product.sku || "",
        name: product.name || "",
        description: product.description || "",
        categoryId: product.categoryId?._id || "",
        unitId: product.unitId?._id || "",
        unit: product.unit || "",
        minimumStock: product.minimumStock ?? 0,
        status: product.status || "active",
      });
    } else {
      setFormData(initialForm);
    }
  }, [product]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleUnitChange = (event) => {
    const unitId = event.target.value;

    const selectedUnit = units.find(
      (unit) => unit._id === unitId
    );

    setFormData((current) => ({
      ...current,
      unitId,
      unit: selectedUnit?.code || "",
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    onSubmit({
      ...formData,
      minimumStock: Number(formData.minimumStock),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            SKU
          </label>

          <input
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            required
            disabled={submitting}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Product Name
          </label>

          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={submitting}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Description
        </label>

        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
          disabled={submitting}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Category */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Category
          </label>

          <select
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            required
            disabled={submitting}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="">Select category</option>

            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Unit */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Unit of Measurement
          </label>

          <select
            name="unitId"
            value={formData.unitId}
            onChange={handleUnitChange}
            required
            disabled={submitting}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="">Select unit</option>

            {units.map((unit) => (
              <option key={unit._id} value={unit._id}>
                {unit.code} — {unit.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Minimum Stock */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Minimum Stock
          </label>

          <input
            type="number"
            name="minimumStock"
            min="0"
            value={formData.minimumStock}
            onChange={handleChange}
            disabled={submitting}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>

        {/* Status */}
        {product && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Status
            </label>

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              disabled={submitting}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 border-t border-slate-200 pt-5 dark:border-slate-700">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting
            ? "Saving..."
            : product
              ? "Update Product"
              : "Create Product"}
        </button>
      </div>
    </form>
  );
}

export default ProductForm;

