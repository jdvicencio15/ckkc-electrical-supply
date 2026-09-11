export const DEFAULT_APP_CONFIG = {
  businessName: "Business Name",
  businessEmail: "",
  contactNumber: "",
  businessAddress: "",

  currency: "PHP",

  appearance: {
    systemName: "APP",
    logo: {
      url: "",
      publicId: "",
    },
  },

  salesInvoicing: {
    invoicePrefix: "INV-",
    quotationPrefix: "QUO-",
    purchasePrefix: "PO-",
    clientPOPrefix: "CPO-",
    supplierPOPrefix: "SPO-",
    salesPrefix: "SO-",

    invoiceStartingNumber: 1,
    quotationStartingNumber: 1,
    purchaseStartingNumber: 1,
    clientPOStartingNumber: 1,
    supplierPOStartingNumber: 1,
    salesStartingNumber: 1,

    defaultPaymentTerms: "",
    defaultTaxRate: 0,
    documentFooter: "",
  },

  inventory: {
    lowStockThreshold: 0,
    allowNegativeStock: false,
    autoDeductStockOnSale: true,
    autoRestoreStockOnSaleCancellation: true,
  },

  accountingTax: {
    vatEnabled: false,
    withholdingTaxEnabled: false,
    fiscalYearStartMonth: 1,
  },

  lowStockNotifications: true,
  invoiceNotifications: true,
};