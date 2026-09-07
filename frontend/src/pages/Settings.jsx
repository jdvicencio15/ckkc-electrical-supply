import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import settingsService from "../services/settingsService";

import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";

function Settings() {
 const [formData, setFormData] = useState({
  businessName: "",
  businessEmail: "",
  contactNumber: "",
  currency: "PHP",

  appearance: {
    logo: "",
    systemName: "CKKC",
  },

  lowStockNotifications: true,
  invoiceNotifications: true,
});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // =========================
  // Load Settings
  // =========================
  const fetchSettings = async () => {
    try {
      setLoading(true);

      const response =
        await settingsService.getSettings();

      const settings = response.settings;

   setFormData({
  businessName: settings?.businessName || "",
  businessEmail: settings?.businessEmail || "",
  contactNumber: settings?.contactNumber || "",
  currency: settings?.currency || "PHP",

  appearance: {
    logo: settings?.appearance?.logo || "",
    systemName:
      settings?.appearance?.systemName || "CKKC",
  },

  lowStockNotifications:
    settings?.lowStockNotifications ?? true,

  invoiceNotifications:
    settings?.invoiceNotifications ?? true,
});
    } catch (error) {
      console.error(
        "Failed to load settings:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to load settings."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // =========================
  // Handle Input
  // =========================
  const handleChange = (e) => {
    const { name, value, type, checked } =
      e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const handleAppearanceChange = (e) => {
  const { name, value } = e.target;

  setFormData((prev) => ({
    ...prev,
    appearance: {
      ...prev.appearance,
      [name]: value,
    },
  }));
  };

  // =========================
  // Save Settings
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      const payload = {
  businessName:
    formData.businessName.trim(),

  businessEmail:
    formData.businessEmail.trim(),

  contactNumber:
    formData.contactNumber.trim(),

  currency: formData.currency,

  appearance: {
    logo: formData.appearance.logo,
    systemName:
      formData.appearance.systemName.trim(),
  },

  lowStockNotifications:
    formData.lowStockNotifications,

  invoiceNotifications:
    formData.invoiceNotifications,
};

      const response =
        await settingsService.updateSettings(
          payload
        );

      const settings = response.settings;

      setFormData({
       businessName: settings?.businessName || "",
  businessEmail: settings?.businessEmail || "",
  contactNumber: settings?.contactNumber || "",
  currency: settings?.currency || "PHP",

  appearance: {
    logo: settings?.appearance?.logo || "",
    systemName:
      settings?.appearance?.systemName || "CKKC",
  },

  lowStockNotifications:
    settings?.lowStockNotifications ?? true,

  invoiceNotifications:
    settings?.invoiceNotifications ?? true,
      });

      toast.success(
        response.message ||
          "Settings updated successfully."
      );
    } catch (error) {
      console.error(
        "Failed to update settings:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to update settings."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =========================
  // Loading State
  // =========================
  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  // =========================
  // Render
  // =========================
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Settings
        </h1>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage system-wide configuration and business preferences.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* General Settings */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              General Settings
            </h2>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Configure basic business information.
            </p>
          </div>

          <div className="grid gap-5 p-6 md:grid-cols-2">
            {/* Business Name */}
            <div>
              <label
                htmlFor="businessName"
                className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Business Name
              </label>

              <input
                id="businessName"
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                placeholder="Enter business name"
                disabled={submitting}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-green-500"
              />
            </div>

            {/* Business Email */}
            <div>
              <label
                htmlFor="businessEmail"
                className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Business Email
              </label>

              <input
                id="businessEmail"
                type="email"
                name="businessEmail"
                value={formData.businessEmail}
                onChange={handleChange}
                placeholder="Enter business email"
                disabled={submitting}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-green-500"
              />
            </div>

            {/* Contact Number */}
            <div>
              <label
                htmlFor="contactNumber"
                className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Contact Number
              </label>

              <input
                id="contactNumber"
                type="text"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                placeholder="Enter contact number"
                disabled={submitting}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-green-500"
              />
            </div>

            {/* Currency */}
            <div>
              <label
                htmlFor="currency"
                className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Currency
              </label>

              <select
                id="currency"
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                disabled={submitting}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-green-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:focus:border-green-500"
              >
                <option value="PHP">
                  PHP — Philippine Peso
                </option>

                <option value="USD">
                  USD — US Dollar
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Appearance */}
<div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
  <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
    <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
      Appearance
    </h2>

    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
      Configure how the system is identified and displayed.
    </p>
  </div>

  <div className="grid gap-5 p-6 md:grid-cols-2">
    {/* System Name */}
    <div>
      <label
        htmlFor="systemName"
        className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
      >
        System Name
      </label>

      <input
        id="systemName"
        type="text"
        name="systemName"
        value={formData.appearance.systemName}
        onChange={handleAppearanceChange}
        placeholder="Enter system name"
        disabled={submitting}
        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-green-500"
      />
    </div>

    {/* Logo */}
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
        Business Logo
      </label>

      <div className="flex min-h-[42px] items-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-800">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Logo upload will be available soon.
        </p>
      </div>

      <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
        Logo storage will use cloud-based image hosting.
      </p>
    </div>
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
            {/* Low Stock Notifications */}
            <div className="flex items-center justify-between gap-6 px-6 py-6">
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
                name="lowStockNotifications"
                checked={
                  formData.lowStockNotifications
                }
                onChange={handleChange}
                disabled={submitting}
                className="h-4 w-4 accent-green-600"
              />
            </div>

            {/* Invoice Notifications */}
            <div className="flex items-center justify-between gap-6 px-6 py-6">
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
                name="invoiceNotifications"
                checked={
                  formData.invoiceNotifications
                }
                onChange={handleChange}
                disabled={submitting}
                className="h-4 w-4 accent-green-600"
              />
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="flex justify-end">
          <Button
            type="submit"
            loading={submitting}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}

export default Settings;