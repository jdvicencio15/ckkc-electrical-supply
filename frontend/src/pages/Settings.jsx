import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

import settingsService from "../services/settingsService";

import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";

import { useSettings } from "../context/SettingsContext";

function DocumentNumberPreview({ systemName, prefix, startingNumber }) {
  return (
    <div className="mt-4 rounded-lg border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
      <p className="text-xs text-slate-500 dark:text-slate-400">Preview</p>

      <p className="mt-1 font-mono text-sm font-semibold text-green-600 dark:text-green-400">
        {systemName || "APP"}-{prefix || ""}
        {new Date().getFullYear()}-
        {String(startingNumber || 1).padStart(6, "0")}
      </p>
    </div>
  );
}

function Settings() {
  const { systemName } = useSettings();

  const [formData, setFormData] = useState({
    businessName: "",
    businessEmail: "",
    contactNumber: "",
    businessAddress: "",
    currency: "PHP",

    appearance: {
      logo: {
        url: "",
        publicId: "",
      },
      systemName: "CKKC",
    },

    salesInvoicing: {
      invoicePrefix: "INV-",

      quotationPrefix: "QUO-",

      purchasePrefix: "PUR-",

      clientPOPrefix: "CPO-",

      supplierPOPrefix: "SPO-",

      salesPrefix: "SAL-",

      invoiceStartingNumber: 1,

      quotationStartingNumber: 1,

      purchaseStartingNumber: 1,

      clientPOStartingNumber: 1,

      supplierPOStartingNumber: 1,

      salesStartingNumber: 1,

      defaultPaymentTerms: "Due on Receipt",

      defaultTaxRate: 0,

      documentFooter: "",
    },

    inventory: {
      lowStockThreshold: 10,
      allowNegativeStock: false,
      autoDeductStockOnSale: true,
      autoRestoreStockOnSaleCancellation: true,
    },

    accountingTax: {
      vatEnabled: false,
      vatRate: 12,
      pricingMode: "inclusive",
      withholdingTaxEnabled: false,
      fiscalYearStartMonth: 1,
    },
    lowStockNotifications: true,
    invoiceNotifications: true,
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [selectedLogo, setSelectedLogo] = useState(null);

  const [logoPreview, setLogoPreview] = useState("");

  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [removingLogo, setRemovingLogo] = useState(false);

  const fileInputRef = useRef(null);

  // =========================
  // Load Settings
  // =========================
  const fetchSettings = async () => {
    try {
      setLoading(true);

      const response = await settingsService.getSettings();

      const settings = response.settings;

      setFormData({
        businessName: settings?.businessName || "",

        businessEmail: settings?.businessEmail || "",

        contactNumber: settings?.contactNumber || "",

        businessAddress: settings?.businessAddress || "",

        currency: settings?.currency || "PHP",

        appearance: {
          logo: {
            url: settings?.appearance?.logo?.url || "",
            publicId: settings?.appearance?.logo?.publicId || "",
          },

          systemName: settings?.appearance?.systemName || "CKKC",
        },

        salesInvoicing: {
          invoicePrefix: settings?.salesInvoicing?.invoicePrefix || "INV-",

          quotationPrefix: settings?.salesInvoicing?.quotationPrefix || "QUO-",

          purchasePrefix: settings?.salesInvoicing?.purchasePrefix || "PUR-",

          clientPOPrefix: settings?.salesInvoicing?.clientPOPrefix || "CPO-",

          supplierPOPrefix:
            settings?.salesInvoicing?.supplierPOPrefix || "SPO-",

          salesPrefix: settings?.salesInvoicing?.salesPrefix || "SAL-",

          invoiceStartingNumber:
            settings?.salesInvoicing?.invoiceStartingNumber || 1,

          quotationStartingNumber:
            settings?.salesInvoicing?.quotationStartingNumber || 1,

          purchaseStartingNumber:
            settings?.salesInvoicing?.purchaseStartingNumber || 1,

          clientPOStartingNumber:
            settings?.salesInvoicing?.clientPOStartingNumber || 1,

          supplierPOStartingNumber:
            settings?.salesInvoicing?.supplierPOStartingNumber || 1,

          salesStartingNumber:
            settings?.salesInvoicing?.salesStartingNumber || 1,

          defaultPaymentTerms:
            settings?.salesInvoicing?.defaultPaymentTerms || "Due on Receipt",

          defaultTaxRate: settings?.salesInvoicing?.defaultTaxRate ?? 0,

          documentFooter: settings?.salesInvoicing?.documentFooter || "",
        },
        inventory: {
          lowStockThreshold: settings?.inventory?.lowStockThreshold ?? 10,

          allowNegativeStock: settings?.inventory?.allowNegativeStock ?? false,

          autoDeductStockOnSale:
            settings?.inventory?.autoDeductStockOnSale ?? true,

          autoRestoreStockOnSaleCancellation:
            settings?.inventory?.autoRestoreStockOnSaleCancellation ?? true,
        },

        accountingTax: {
          vatEnabled: settings?.accountingTax?.vatEnabled ?? false,

          vatRate: settings?.accountingTax?.vatRate ?? 12,

          pricingMode: settings?.accountingTax?.pricingMode ?? "inclusive",

          withholdingTaxEnabled:
            settings?.accountingTax?.withholdingTaxEnabled ?? false,

          fiscalYearStartMonth:
            settings?.accountingTax?.fiscalYearStartMonth ?? 1,
        },

        lowStockNotifications: settings?.lowStockNotifications ?? true,

        invoiceNotifications: settings?.invoiceNotifications ?? true,
      });
    } catch (error) {
      console.error("Failed to load settings:", error);

      toast.error(error.response?.data?.message || "Failed to load settings.");
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
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
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
  // Logo File Selection
  // =========================
  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, and WEBP images are allowed.");

      e.target.value = "";
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      toast.error("Logo image must not exceed 5MB.");

      e.target.value = "";
      return;
    }

    setSelectedLogo(file);

    const previewUrl = URL.createObjectURL(file);

    setLogoPreview(previewUrl);
  };

  // =========================
  // Upload Logo
  // =========================
  const handleLogoUpload = async () => {
    if (!selectedLogo) {
      toast.error("Please select a logo image first.");

      return;
    }

    try {
      setUploadingLogo(true);

      const formData = new FormData();

      formData.append("logo", selectedLogo);

      const response = await settingsService.uploadLogo(formData);

      setFormData((prev) => ({
        ...prev,

        appearance: {
          ...prev.appearance,

          logo: {
            url: response.logo?.url || "",

            publicId: response.logo?.publicId || "",
          },
        },
      }));

      setSelectedLogo(null);
      setLogoPreview("");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      toast.success(response.message || "Business logo uploaded successfully.");
    } catch (error) {
      console.error("Failed to upload logo:", error);

      toast.error(
        error.response?.data?.message || "Failed to upload business logo.",
      );
    } finally {
      setUploadingLogo(false);
    }
  };

  // =========================
  // Remove Logo
  // =========================
  const handleRemoveLogo = async () => {
    if (!formData.appearance.logo.url) {
      toast.error("No business logo found.");

      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to remove the business logo?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setRemovingLogo(true);

      const response = await settingsService.removeLogo();

      setFormData((prev) => ({
        ...prev,

        appearance: {
          ...prev.appearance,

          logo: {
            url: "",
            publicId: "",
          },
        },
      }));

      setSelectedLogo(null);
      setLogoPreview("");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      toast.success(response.message || "Business logo removed successfully.");
    } catch (error) {
      console.error("Failed to remove logo:", error);

      toast.error(
        error.response?.data?.message || "Failed to remove business logo.",
      );
    } finally {
      setRemovingLogo(false);
    }
  };

  // =========================
  // Save Settings
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      const payload = {
        businessName: formData.businessName.trim(),

        businessEmail: formData.businessEmail.trim(),

        contactNumber: formData.contactNumber.trim(),

        businessAddress: formData.businessAddress.trim(),

        currency: formData.currency,

        appearance: {
          systemName: formData.appearance.systemName.trim(),
        },

        salesInvoicing: {
          invoicePrefix: formData.salesInvoicing.invoicePrefix.trim(),

          quotationPrefix: formData.salesInvoicing.quotationPrefix.trim(),

          purchasePrefix: formData.salesInvoicing.purchasePrefix.trim(),

          clientPOPrefix: formData.salesInvoicing.clientPOPrefix.trim(),

          supplierPOPrefix: formData.salesInvoicing.supplierPOPrefix.trim(),

          salesPrefix: formData.salesInvoicing.salesPrefix.trim(),

          invoiceStartingNumber: Number(
            formData.salesInvoicing.invoiceStartingNumber,
          ),

          quotationStartingNumber: Number(
            formData.salesInvoicing.quotationStartingNumber,
          ),

          purchaseStartingNumber: Number(
            formData.salesInvoicing.purchaseStartingNumber,
          ),

          clientPOStartingNumber: Number(
            formData.salesInvoicing.clientPOStartingNumber,
          ),

          supplierPOStartingNumber: Number(
            formData.salesInvoicing.supplierPOStartingNumber,
          ),

          salesStartingNumber: Number(
            formData.salesInvoicing.salesStartingNumber,
          ),

          defaultPaymentTerms:
            formData.salesInvoicing.defaultPaymentTerms.trim(),

          defaultTaxRate: Number(formData.salesInvoicing.defaultTaxRate),

          documentFooter: formData.salesInvoicing.documentFooter.trim(),
        },

        // ✅ INVENTORY IS OUTSIDE SALES INVOICING
        inventory: {
          lowStockThreshold: Number(formData.inventory.lowStockThreshold),

          allowNegativeStock: formData.inventory.allowNegativeStock,

          autoDeductStockOnSale: formData.inventory.autoDeductStockOnSale,

          autoRestoreStockOnSaleCancellation:
            formData.inventory.autoRestoreStockOnSaleCancellation,
        },

       accountingTax: {
  vatEnabled: formData.accountingTax.vatEnabled,

  vatRate: Number(formData.accountingTax.vatRate),

  pricingMode: formData.accountingTax.pricingMode,

  withholdingTaxEnabled: formData.accountingTax.withholdingTaxEnabled,

  fiscalYearStartMonth: Number(
    formData.accountingTax.fiscalYearStartMonth,
  ),
},

        lowStockNotifications: formData.lowStockNotifications,

        invoiceNotifications: formData.invoiceNotifications,
      };

      const response = await settingsService.updateSettings(payload);

      const settings = response.settings;

      setFormData((prev) => ({
        ...prev,

        businessName: settings?.businessName || "",

        businessEmail: settings?.businessEmail || "",

        contactNumber: settings?.contactNumber || "",

        businessAddress: settings?.businessAddress || "",

        currency: settings?.currency || "PHP",

        appearance: {
          logo: {
            url: settings?.appearance?.logo?.url || prev.appearance.logo.url,

            publicId:
              settings?.appearance?.logo?.publicId ||
              prev.appearance.logo.publicId,
          },

          systemName: settings?.appearance?.systemName || "CKKC",
        },

        salesInvoicing: {
          invoicePrefix: settings?.salesInvoicing?.invoicePrefix || "INV-",

          quotationPrefix: settings?.salesInvoicing?.quotationPrefix || "QUO-",

          purchasePrefix: settings?.salesInvoicing?.purchasePrefix || "PUR-",

          clientPOPrefix: settings?.salesInvoicing?.clientPOPrefix || "CPO-",

          supplierPOPrefix:
            settings?.salesInvoicing?.supplierPOPrefix || "SPO-",

          salesPrefix: settings?.salesInvoicing?.salesPrefix || "SAL-",

          invoiceStartingNumber:
            settings?.salesInvoicing?.invoiceStartingNumber || 1,

          quotationStartingNumber:
            settings?.salesInvoicing?.quotationStartingNumber || 1,

          purchaseStartingNumber:
            settings?.salesInvoicing?.purchaseStartingNumber || 1,

          clientPOStartingNumber:
            settings?.salesInvoicing?.clientPOStartingNumber || 1,

          supplierPOStartingNumber:
            settings?.salesInvoicing?.supplierPOStartingNumber || 1,

          salesStartingNumber:
            settings?.salesInvoicing?.salesStartingNumber || 1,

          defaultPaymentTerms:
            settings?.salesInvoicing?.defaultPaymentTerms || "Due on Receipt",

          defaultTaxRate: settings?.salesInvoicing?.defaultTaxRate ?? 0,

          documentFooter: settings?.salesInvoicing?.documentFooter || "",
        },

        accountingTax: {
          vatEnabled: settings?.accountingTax?.vatEnabled ?? false,

          withholdingTaxEnabled:
            settings?.accountingTax?.withholdingTaxEnabled ?? false,

          fiscalYearStartMonth:
            settings?.accountingTax?.fiscalYearStartMonth ?? 1,
        },

        lowStockNotifications: settings?.lowStockNotifications ?? true,

        invoiceNotifications: settings?.invoiceNotifications ?? true,
      }));

      toast.success(response.message || "Settings updated successfully.");
    } catch (error) {
      console.error("Failed to update settings:", error);

      toast.error(
        error.response?.data?.message || "Failed to update settings.",
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

  const hasLogo = Boolean(formData.appearance.logo.url);

  const displayLogo = logoPreview || formData.appearance.logo.url;

  const logoBusy = uploadingLogo || removingLogo || submitting;

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

      <form onSubmit={handleSubmit} className="space-y-6">
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

            {/* Business Address */}
            <div>
              <label
                htmlFor="businessAddress"
                className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Business Address
              </label>

              <textarea
                id="businessAddress"
                name="businessAddress"
                value={formData.businessAddress}
                onChange={handleChange}
                placeholder="Enter business address"
                rows={3}
                disabled={submitting}
                className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-green-500"
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
                <option value="PHP">PHP — Philippine Peso</option>

                <option value="USD">USD — US Dollar</option>
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

          <div className="grid gap-6 p-6 md:grid-cols-2">
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

            {/* Business Logo */}
            <div>
              <label
                htmlFor="businessLogo"
                className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Business Logo
              </label>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                {/* Preview */}
                <div className="flex min-h-[180px] items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-4 dark:border-slate-600 dark:bg-slate-900">
                  {displayLogo ? (
                    <img
                      src={displayLogo}
                      alt="Business logo preview"
                      className="max-h-36 max-w-full object-contain"
                    />
                  ) : (
                    <div className="text-center">
                      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="h-7 w-7"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l1.409 1.409m2.25 2.25 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 18.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6.75a1.5 1.5 0 0 0-1.5-1.5H3.75a1.5 1.5 0 0 0-1.5 1.5v10.5a1.5 1.5 0 0 0 1.5 1.5ZM6.75 8.25h.008v.008H6.75V8.25Z"
                          />
                        </svg>
                      </div>

                      <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        No logo uploaded
                      </p>

                      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                        Upload your business logo below.
                      </p>
                    </div>
                  )}
                </div>

                {/* File Input */}
                <input
                  ref={fileInputRef}
                  id="businessLogo"
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  onChange={handleLogoChange}
                  disabled={logoBusy}
                  className="mt-4 block w-full cursor-pointer text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-green-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60 dark:text-slate-400"
                />

                <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                  JPG, PNG, or WEBP · Maximum 5MB
                </p>

                {/* Actions */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedLogo && (
                    <Button
                      type="button"
                      onClick={handleLogoUpload}
                      loading={uploadingLogo}
                      disabled={logoBusy}
                    >
                      {hasLogo ? "Replace Logo" : "Upload Logo"}
                    </Button>
                  )}

                  {hasLogo && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleRemoveLogo}
                      loading={removingLogo}
                      disabled={logoBusy}
                    >
                      Remove Logo
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sales & Invoicing */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Sales & Invoicing
            </h2>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Configure document numbering, payment, tax, and document defaults.
            </p>
          </div>

          <div className="p-6">
            {/* Document Numbering */}
            <div>
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Document Numbering
                </h3>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Configure prefixes and starting numbers for system-generated
                  documents.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {/* Quotation */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800/50">
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Quotation
                    </h4>

                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Numbering for customer quotations.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="quotationPrefix"
                        className="mb-2 block text-xs font-medium text-slate-700 dark:text-slate-300"
                      >
                        Prefix
                      </label>

                      <input
                        id="quotationPrefix"
                        type="text"
                        value={formData.salesInvoicing.quotationPrefix}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            salesInvoicing: {
                              ...prev.salesInvoicing,
                              quotationPrefix: e.target.value,
                            },
                          }))
                        }
                        placeholder="QUO-"
                        disabled={submitting}
                        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-green-500"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="quotationStartingNumber"
                        className="mb-2 block text-xs font-medium text-slate-700 dark:text-slate-300"
                      >
                        Starting Number
                      </label>

                      <input
                        id="quotationStartingNumber"
                        type="number"
                        min="1"
                        value={formData.salesInvoicing.quotationStartingNumber}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            salesInvoicing: {
                              ...prev.salesInvoicing,
                              quotationStartingNumber: e.target.value,
                            },
                          }))
                        }
                        disabled={submitting}
                        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-green-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-green-500"
                      />
                    </div>
                  </div>

                  <DocumentNumberPreview
                    systemName={systemName}
                    prefix={formData.salesInvoicing.quotationPrefix}
                    startingNumber={
                      formData.salesInvoicing.quotationStartingNumber
                    }
                  />
                </div>

                {/* Client PO */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800/50">
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Client PO
                    </h4>

                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Numbering for client purchase orders.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="clientPOPrefix"
                        className="mb-2 block text-xs font-medium text-slate-700 dark:text-slate-300"
                      >
                        Prefix
                      </label>

                      <input
                        id="clientPOPrefix"
                        type="text"
                        value={formData.salesInvoicing.clientPOPrefix}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            salesInvoicing: {
                              ...prev.salesInvoicing,
                              clientPOPrefix: e.target.value,
                            },
                          }))
                        }
                        placeholder="CPO-"
                        disabled={submitting}
                        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-green-500"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="clientPOStartingNumber"
                        className="mb-2 block text-xs font-medium text-slate-700 dark:text-slate-300"
                      >
                        Starting Number
                      </label>

                      <input
                        id="clientPOStartingNumber"
                        type="number"
                        min="1"
                        value={formData.salesInvoicing.clientPOStartingNumber}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            salesInvoicing: {
                              ...prev.salesInvoicing,
                              clientPOStartingNumber: e.target.value,
                            },
                          }))
                        }
                        disabled={submitting}
                        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-green-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-green-500"
                      />
                    </div>
                  </div>

                  <DocumentNumberPreview
                    systemName={systemName}
                    prefix={formData.salesInvoicing.clientPOPrefix}
                    startingNumber={
                      formData.salesInvoicing.clientPOStartingNumber
                    }
                  />
                </div>

                {/* Supplier PO */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800/50">
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Supplier PO
                    </h4>

                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Numbering for supplier purchase orders.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="supplierPOPrefix"
                        className="mb-2 block text-xs font-medium text-slate-700 dark:text-slate-300"
                      >
                        Prefix
                      </label>

                      <input
                        id="supplierPOPrefix"
                        type="text"
                        value={formData.salesInvoicing.supplierPOPrefix}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            salesInvoicing: {
                              ...prev.salesInvoicing,
                              supplierPOPrefix: e.target.value,
                            },
                          }))
                        }
                        placeholder="SPO-"
                        disabled={submitting}
                        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-green-500"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="supplierPOStartingNumber"
                        className="mb-2 block text-xs font-medium text-slate-700 dark:text-slate-300"
                      >
                        Starting Number
                      </label>

                      <input
                        id="supplierPOStartingNumber"
                        type="number"
                        min="1"
                        value={formData.salesInvoicing.supplierPOStartingNumber}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            salesInvoicing: {
                              ...prev.salesInvoicing,
                              supplierPOStartingNumber: e.target.value,
                            },
                          }))
                        }
                        disabled={submitting}
                        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-green-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-green-500"
                      />
                    </div>
                  </div>

                  <DocumentNumberPreview
                    systemName={systemName}
                    prefix={formData.salesInvoicing.supplierPOPrefix}
                    startingNumber={
                      formData.salesInvoicing.supplierPOStartingNumber
                    }
                  />
                </div>

                {/* Sales */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800/50">
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Sales
                    </h4>

                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Numbering for sales transactions.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="salesPrefix"
                        className="mb-2 block text-xs font-medium text-slate-700 dark:text-slate-300"
                      >
                        Prefix
                      </label>

                      <input
                        id="salesPrefix"
                        type="text"
                        value={formData.salesInvoicing.salesPrefix}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            salesInvoicing: {
                              ...prev.salesInvoicing,
                              salesPrefix: e.target.value,
                            },
                          }))
                        }
                        placeholder="SAL-"
                        disabled={submitting}
                        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-green-500"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="salesStartingNumber"
                        className="mb-2 block text-xs font-medium text-slate-700 dark:text-slate-300"
                      >
                        Starting Number
                      </label>

                      <input
                        id="salesStartingNumber"
                        type="number"
                        min="1"
                        value={formData.salesInvoicing.salesStartingNumber}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            salesInvoicing: {
                              ...prev.salesInvoicing,
                              salesStartingNumber: e.target.value,
                            },
                          }))
                        }
                        disabled={submitting}
                        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-green-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-green-500"
                      />
                    </div>
                  </div>

                  <DocumentNumberPreview
                    systemName={systemName}
                    prefix={formData.salesInvoicing.salesPrefix}
                    startingNumber={formData.salesInvoicing.salesStartingNumber}
                  />
                </div>

                {/* Purchase */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800/50">
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Purchase
                    </h4>

                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Numbering for purchase transactions.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="purchasePrefix"
                        className="mb-2 block text-xs font-medium text-slate-700 dark:text-slate-300"
                      >
                        Prefix
                      </label>

                      <input
                        id="purchasePrefix"
                        type="text"
                        value={formData.salesInvoicing.purchasePrefix}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            salesInvoicing: {
                              ...prev.salesInvoicing,
                              purchasePrefix: e.target.value,
                            },
                          }))
                        }
                        placeholder="PUR-"
                        disabled={submitting}
                        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-green-500"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="purchaseStartingNumber"
                        className="mb-2 block text-xs font-medium text-slate-700 dark:text-slate-300"
                      >
                        Starting Number
                      </label>

                      <input
                        id="purchaseStartingNumber"
                        type="number"
                        min="1"
                        value={formData.salesInvoicing.purchaseStartingNumber}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            salesInvoicing: {
                              ...prev.salesInvoicing,
                              purchaseStartingNumber: e.target.value,
                            },
                          }))
                        }
                        disabled={submitting}
                        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-green-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-green-500"
                      />
                    </div>
                  </div>

                  <DocumentNumberPreview
                    systemName={systemName}
                    prefix={formData.salesInvoicing.purchasePrefix}
                    startingNumber={
                      formData.salesInvoicing.purchaseStartingNumber
                    }
                  />
                </div>

                {/* Invoice */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800/50">
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Invoice
                    </h4>

                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Numbering for customer invoices.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="invoicePrefix"
                        className="mb-2 block text-xs font-medium text-slate-700 dark:text-slate-300"
                      >
                        Prefix
                      </label>

                      <input
                        id="invoicePrefix"
                        type="text"
                        value={formData.salesInvoicing.invoicePrefix}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            salesInvoicing: {
                              ...prev.salesInvoicing,
                              invoicePrefix: e.target.value,
                            },
                          }))
                        }
                        placeholder="INV-"
                        disabled={submitting}
                        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-green-500"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="invoiceStartingNumber"
                        className="mb-2 block text-xs font-medium text-slate-700 dark:text-slate-300"
                      >
                        Starting Number
                      </label>

                      <input
                        id="invoiceStartingNumber"
                        type="number"
                        min="1"
                        value={formData.salesInvoicing.invoiceStartingNumber}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            salesInvoicing: {
                              ...prev.salesInvoicing,
                              invoiceStartingNumber: e.target.value,
                            },
                          }))
                        }
                        disabled={submitting}
                        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-green-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-green-500"
                      />
                    </div>
                  </div>

                  <DocumentNumberPreview
                    systemName={systemName}
                    prefix={formData.salesInvoicing.invoicePrefix}
                    startingNumber={
                      formData.salesInvoicing.invoiceStartingNumber
                    }
                  />
                </div>
              </div>

              <div className="mt-5 rounded-lg border border-green-100 bg-green-50 px-4 py-3 dark:border-green-900/30 dark:bg-green-950/20">
                <p className="text-xs font-medium text-green-800 dark:text-green-300">
                  Number Format
                </p>

                <p className="mt-1 text-xs text-green-700 dark:text-green-400">
                  Document numbers follow the format{" "}
                  <span className="font-mono font-semibold">
                    {systemName}-PREFIX-YEAR-SEQUENCE
                  </span>
                  .
                </p>

                <p className="mt-1 text-xs text-green-600 dark:text-green-500">
                  Example:{" "}
                  <span className="font-mono">
                    {systemName}-{formData.salesInvoicing.quotationPrefix}
                    {new Date().getFullYear()}-
                    {String(
                      formData.salesInvoicing.quotationStartingNumber || 1,
                    ).padStart(6, "0")}
                  </span>
                </p>
              </div>
            </div>

            {/* Sales Defaults */}
            <div className="mt-8 border-t border-slate-200 pt-6 dark:border-slate-800">
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Sales Defaults
                </h3>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Configure default values used by sales and business documents.
                </p>
              </div>



              <div className="grid gap-5 md:grid-cols-2">
                {/* Default Payment Terms */}
                <div>
                  <label
                    htmlFor="defaultPaymentTerms"
                    className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Default Payment Terms
                  </label>

                  <select
                    id="defaultPaymentTerms"
                    value={formData.salesInvoicing.defaultPaymentTerms}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        salesInvoicing: {
                          ...prev.salesInvoicing,
                          defaultPaymentTerms: e.target.value,
                        },
                      }))
                    }
                    disabled={submitting}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-green-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:focus:border-green-500"
                  >
                    <option value="Due on Receipt">Due on Receipt</option>
                    <option value="7 Days">7 Days</option>
                    <option value="15 Days">15 Days</option>
                    <option value="30 Days">30 Days</option>
                    <option value="45 Days">45 Days</option>
                    <option value="60 Days">60 Days</option>
                  </select>
                </div>

                {/* Document Footer */}
                <div className="md:col-span-2">
                  <label
                    htmlFor="documentFooter"
                    className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Document Footer
                  </label>

                  <textarea
                    id="documentFooter"
                    value={formData.salesInvoicing.documentFooter}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        salesInvoicing: {
                          ...prev.salesInvoicing,
                          documentFooter: e.target.value,
                        },
                      }))
                    }
                    placeholder="Example: Thank you for your business!"
                    rows={3}
                    disabled={submitting}
                    className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-green-500"
                  />

                  <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
                    This can be displayed on invoices, quotations, and other
                    business documents.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

         {/* Accounting & Tax */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Accounting & Tax
            </h2>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Configure tax and accounting preferences.
            </p>
          </div>


          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {/* VAT Enabled */}
<div className="flex items-center justify-between gap-6 px-6 py-6">
  <div>
    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
      VAT Enabled
    </p>

    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
      Enable VAT-related calculations and tax handling.
    </p>
  </div>

  <input
    type="checkbox"
    checked={formData.accountingTax.vatEnabled}
    onChange={(e) =>
      setFormData((prev) => ({
        ...prev,
        accountingTax: {
          ...prev.accountingTax,
          vatEnabled: e.target.checked,
        },
      }))
    }
    disabled={submitting}
    className="h-4 w-4 accent-green-600"
  />
</div>
            {/* VAT Rate */}
            <div className="px-6 py-6">
              <div className="max-w-md">
                <label
                  htmlFor="vatRate"
                  className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  VAT Rate (%)
                </label>

                <input
  id="vatRate"
  type="number"
  min="0"
  max="100"
  step="0.01"
  value={
    formData.accountingTax.vatEnabled
      ? formData.accountingTax.vatRate
      : ""
  }
  onChange={(e) =>
    setFormData((prev) => ({
      ...prev,
      accountingTax: {
        ...prev.accountingTax,
        vatRate: e.target.value,
      },
    }))
  }
  disabled={submitting || !formData.accountingTax.vatEnabled}
  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-green-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:focus:border-green-500"
  placeholder={
    formData.accountingTax.vatEnabled
      ? "12.00"
      : "VAT Disabled"
  }
/>

                <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
                  VAT rate applied to applicable transactions.
                </p>
              </div>
            </div>

            {/* Pricing Mode */}
            <div className="px-6 py-6">
              <div className="max-w-md">
                <label
                  htmlFor="pricingMode"
                  className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Pricing Mode
                </label>

              <select
  id="pricingMode"
  value={
    formData.accountingTax.vatEnabled
      ? formData.accountingTax.pricingMode
      : ""
  }
  onChange={(e) =>
    setFormData((prev) => ({
      ...prev,
      accountingTax: {
        ...prev.accountingTax,
        pricingMode: e.target.value,
      },
    }))
  }
  disabled={submitting || !formData.accountingTax.vatEnabled}
  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-green-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:focus:border-green-500"
>
  {!formData.accountingTax.vatEnabled && (
    <option value="">VAT Disabled</option>
  )}

  <option value="inclusive">VAT Inclusive</option>
  <option value="exclusive">VAT Exclusive</option>
</select>

                <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
                  Determines whether displayed prices include or exclude VAT.
                </p>
              </div>
            </div>

            {/* Withholding Tax */}
            <div className="flex items-center justify-between gap-6 px-6 py-6">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  Withholding Tax
                </p>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Enable withholding tax handling for applicable transactions.
                </p>
              </div>

              <input
                type="checkbox"
                checked={formData.accountingTax.withholdingTaxEnabled}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    accountingTax: {
                      ...prev.accountingTax,
                      withholdingTaxEnabled: e.target.checked,
                    },
                  }))
                }
                disabled={submitting}
                className="h-4 w-4 accent-green-600"
              />
            </div>

            {/* Fiscal Year Start */}
            <div className="px-6 py-6">
              <div className="max-w-md">
                <label
                  htmlFor="fiscalYearStartMonth"
                  className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Fiscal Year Start Month
                </label>

                <select
                  id="fiscalYearStartMonth"
                  value={formData.accountingTax.fiscalYearStartMonth}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      accountingTax: {
                        ...prev.accountingTax,
                        fiscalYearStartMonth: e.target.value,
                      },
                    }))
                  }
                  disabled={submitting}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-green-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:focus:border-green-500"
                >
                  <option value="1">January</option>
                  <option value="2">February</option>
                  <option value="3">March</option>
                  <option value="4">April</option>
                  <option value="5">May</option>
                  <option value="6">June</option>
                  <option value="7">July</option>
                  <option value="8">August</option>
                  <option value="9">September</option>
                  <option value="10">October</option>
                  <option value="11">November</option>
                  <option value="12">December</option>
                </select>

                <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
                  Determines the starting month used for the accounting fiscal
                  year.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Settings */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Inventory Settings
            </h2>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Configure stock behavior and inventory preferences.
            </p>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {/* Allow Negative Stock */}
            <div className="flex items-center justify-between gap-6 px-6 py-6">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  Allow Negative Stock
                </p>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Allow sales transactions even when available stock reaches
                  zero.
                </p>
              </div>

              <input
                type="checkbox"
                checked={formData.inventory.allowNegativeStock}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    inventory: {
                      ...prev.inventory,
                      allowNegativeStock: e.target.checked,
                    },
                  }))
                }
                disabled={submitting}
                className="h-4 w-4 accent-green-600"
              />
            </div>

            {/* Auto Deduct Stock */}
            <div className="flex items-center justify-between gap-6 px-6 py-6">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  Auto Deduct Stock on Sale
                </p>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Automatically reduce inventory when a sale is completed.
                </p>
              </div>

              <input
                type="checkbox"
                checked={formData.inventory.autoDeductStockOnSale}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    inventory: {
                      ...prev.inventory,
                      autoDeductStockOnSale: e.target.checked,
                    },
                  }))
                }
                disabled={submitting}
                className="h-4 w-4 accent-green-600"
              />
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
                checked={formData.lowStockNotifications}
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
                checked={formData.invoiceNotifications}
                onChange={handleChange}
                disabled={submitting}
                className="h-4 w-4 accent-green-600"
              />
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="flex justify-end">
          <Button type="submit" loading={submitting}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}

export default Settings;
