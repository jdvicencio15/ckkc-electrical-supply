
import { useEffect, useState } from "react";

const CustomerForm = ({
  customer = null,
  onSubmit,
  onClose,
  submitting = false,
}) => {
  const isEditing = Boolean(customer);

  const [formData, setFormData] = useState({
    customerCode: "",
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    status: "active",
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        customerCode: customer.customerCode || "",
        name: customer.name || "",
        contactPerson: customer.contactPerson || "",
        email: customer.email || "",
        phone: customer.phone || "",
        address: customer.address || "",
        status: customer.status || "active",
      });

      return;
    }

    setFormData({
      customerCode: "",
      name: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      status: "active",
    });
  }, [customer]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    onSubmit({
      ...formData,
      customerCode: formData.customerCode.trim(),
      name: formData.name.trim(),
      contactPerson: formData.contactPerson.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl dark:bg-slate-800">

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            {isEditing ? "Edit Customer" : "Add Customer"}
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {isEditing
              ? "Update the customer information."
              : "Add a new customer and their account information."}
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          {/* Customer Code + Name */}
          <div className="grid gap-4 md:grid-cols-2">

            <div>
              <label
                htmlFor="customerCode"
                className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Customer Code
              </label>

              <input
                id="customerCode"
                name="customerCode"
                type="text"
                value={formData.customerCode}
                onChange={handleChange}
                placeholder="e.g. CUS-002"
                maxLength={50}
                disabled={submitting}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
            </div>

            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Customer Name
              </label>

              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. ABC Construction"
                maxLength={150}
                disabled={submitting}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
            </div>

          </div>

          {/* Contact Person + Email */}
          <div className="mt-4 grid gap-4 md:grid-cols-2">

            <div>
              <label
                htmlFor="contactPerson"
                className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Contact Person
              </label>

              <input
                id="contactPerson"
                name="contactPerson"
                type="text"
                value={formData.contactPerson}
                onChange={handleChange}
                placeholder="e.g. Juan Dela Cruz"
                maxLength={150}
                disabled={submitting}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. customer@example.com"
                disabled={submitting}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
            </div>

          </div>

          {/* Phone + Status */}
          <div className="mt-4 grid gap-4 md:grid-cols-2">

            <div>
              <label
                htmlFor="phone"
                className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Phone
              </label>

              <input
                id="phone"
                name="phone"
                type="text"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. 09181234567"
                maxLength={30}
                disabled={submitting}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
            </div>

            <div>
              <label
                htmlFor="status"
                className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Status
              </label>

              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={submitting}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

          </div>

          {/* Address */}
          <div className="mt-4">
            <label
              htmlFor="address"
              className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Address
            </label>

            <textarea
              id="address"
              name="address"
              rows="3"
              value={formData.address}
              onChange={handleChange}
              placeholder="Customer address..."
              maxLength={500}
              disabled={submitting}
              className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            />
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-3">

            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? isEditing
                  ? "Updating..."
                  : "Saving..."
                : isEditing
                  ? "Update Customer"
                  : "Save Customer"}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
};

export default CustomerForm;

