
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
  initialSupplierPricing: {
    supplierId: "",
    unitCost: "",
  },
};

function ProductForm({
  categories,
  units,
  suppliers,
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
  initialSupplierPricing: {
    supplierId: "",
    unitCost: "",
  },
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


const handleSupplierChange = (event) => {
  const supplierId = event.target.value;

  setFormData((current) => ({
    ...current,
    initialSupplierPricing: {
      ...current.initialSupplierPricing,
      supplierId,
    },
  }));
};

const handleSupplierCostChange = (event) => {
  const unitCost = event.target.value;

  setFormData((current) => ({
    ...current,
    initialSupplierPricing: {
      ...current.initialSupplierPricing,
      unitCost,
    },
  }));
};

  const handleSubmit = (event) => {
  event.preventDefault();

  const payload = {
    ...formData,
    minimumStock: Number(formData.minimumStock),
  };

  const { initialSupplierPricing } = payload;

  if (
    !initialSupplierPricing?.supplierId &&
    !initialSupplierPricing?.unitCost
  ) {
    delete payload.initialSupplierPricing;
  } else {
    payload.initialSupplierPricing = {
      supplierId: initialSupplierPricing.supplierId,
      unitCost: Number(initialSupplierPricing.unitCost),
    };
  }

  onSubmit(payload);
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


{!product && (
  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
    <div className="mb-4">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
        Initial Supplier Pricing
      </h3>

      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Optional — you can add supplier pricing later.
      </p>
    </div>

    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Supplier
        </label>

        <select
          value={formData.initialSupplierPricing.supplierId}
          onChange={handleSupplierChange}
          disabled={submitting}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        >
          <option value="">Select supplier</option>

          {suppliers.map((supplier) => (
            <option key={supplier._id} value={supplier._id}>
              {supplier.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Unit Cost
        </label>

        <input
          type="number"
          min="0"
          step="0.01"
          value={formData.initialSupplierPricing.unitCost}
          onChange={handleSupplierCostChange}
          disabled={submitting}
          placeholder="0.00"
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
      </div>
    </div>
  </div>
)}



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

