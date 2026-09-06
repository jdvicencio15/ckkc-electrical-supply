
import { useEffect, useState } from "react";

function SupplierModal({
  supplier,
  onClose,
  onSuccess,
  createSupplier,
  updateSupplier,
}) {
  const isEditMode = Boolean(supplier);

  const [formData, setFormData] = useState({
    supplierCode: "",
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    supplierType: "local",
    status: "active",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (supplier) {
      setFormData({
        supplierCode: supplier.supplierCode || "",
        name: supplier.name || "",
        contactPerson: supplier.contactPerson || "",
        email: supplier.email || "",
        phone: supplier.phone || "",
        address: supplier.address || "",
        supplierType: supplier.supplierType || "local",
        status: supplier.status || "active",
      });
    }
  }, [supplier]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!formData.supplierCode.trim()) {
      setError("Supplier code is required.");
      return;
    }

    if (!formData.name.trim()) {
      setError("Supplier name is required.");
      return;
    }

    try {
      setIsSubmitting(true);

      const supplierData = {
        ...formData,
        supplierCode: formData.supplierCode.trim(),
        name: formData.name.trim(),
        contactPerson: formData.contactPerson.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
      };

      if (isEditMode) {
        await updateSupplier(
          supplier._id,
          supplierData
        );
      } else {
        await createSupplier(supplierData);
      }

      onSuccess();
    } catch (error) {
      console.error(
        `Failed to ${
          isEditMode ? "update" : "create"
        } supplier:`,
        error
      );

      const message =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.msg ||
        `Failed to ${
          isEditMode ? "update" : "create"
        } supplier.`;

      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {isEditMode
                ? "Edit Supplier"
                : "Add Supplier"}
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {isEditMode
                ? "Update supplier information."
                : "Add a new supplier to your supplier list."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-2xl leading-none text-slate-400 transition hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:text-slate-200"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>

          <div className="space-y-5 px-6 py-6">

            {/* Error */}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
                {error}
              </div>
            )}

            {/* Supplier Code + Name */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

              <div>
                <label
                  htmlFor="supplierCode"
                  className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Supplier Code{" "}
                  <span className="text-red-500">
                    *
                  </span>
                </label>

                <input
                  id="supplierCode"
                  name="supplierCode"
                  type="text"
                  value={formData.supplierCode}
                  onChange={handleChange}
                  maxLength={50}
                  placeholder="e.g. SUP-0001"
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label
                  htmlFor="name"
                  className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Supplier Name{" "}
                  <span className="text-red-500">
                    *
                  </span>
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  maxLength={150}
                  placeholder="e.g. ABC Electrical Supply"
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

            </div>

            {/* Contact Person + Phone */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

              <div>
                <label
                  htmlFor="contactPerson"
                  className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Contact Person
                </label>

                <input
                  id="contactPerson"
                  name="contactPerson"
                  type="text"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  maxLength={150}
                  placeholder="e.g. Juan Dela Cruz"
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Phone
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="text"
                  value={formData.phone}
                  onChange={handleChange}
                  maxLength={30}
                  placeholder="e.g. 0917 123 4567"
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. supplier@example.com"
                disabled={isSubmitting}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            {/* Supplier Type + Status */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

              <div>
                <label
                  htmlFor="supplierType"
                  className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Supplier Type
                </label>

                <select
                  id="supplierType"
                  name="supplierType"
                  value={formData.supplierType}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-green-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  <option value="local">
                    Local
                  </option>

                  <option value="international">
                    International
                  </option>
                </select>
              </div>

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
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-green-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  <option value="active">
                    Active
                  </option>

                  <option value="inactive">
                    Inactive
                  </option>
                </select>
              </div>

            </div>

            {/* Address */}
            <div>
              <label
                htmlFor="address"
                className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Address
              </label>

              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                maxLength={500}
                rows={3}
                placeholder="Supplier business address"
                disabled={isSubmitting}
                className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4 dark:border-slate-800">

            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? "Saving..."
                : isEditMode
                ? "Save Changes"
                : "Save Supplier"}
            </button>

          </div>

        </form>

      </div>
    </div>
  );
}

export default SupplierModal;

