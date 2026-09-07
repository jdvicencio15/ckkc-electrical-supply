const Product = require("../models/Product");
const Category = require("../models/Category");
const Customer = require("../models/Customer");
const Supplier = require("../models/Supplier");
const Sale = require("../models/Sale");
const Purchase = require("../models/Purchase");
const Quotation = require("../models/Quotation");
const Invoice = require("../models/Invoice");
const Payment = require("../models/Payment");
const ChartOfAccount = require("../models/chartOfAccount");

// =====================================================
// SEARCH CONFIGURATION
// =====================================================

const searchableModules = {
  owner: [
    "products",
    "categories",
    "customers",
    "suppliers",
    "sales",
    "purchases",
    "quotations",
    "invoices",
    "payments",
    "accounting",
  ],

  admin: [
    "products",
    "categories",
    "customers",
    "suppliers",
    "sales",
    "purchases",
    "quotations",
    "invoices",
    "payments",
    "accounting",
  ],

  sales: [
    "products",
    "categories",
    "customers",
    "sales",
    "quotations",
    "invoices",
  ],

  purchasing: [
    "products",
    "categories",
    "suppliers",
    "purchases",
  ],

  accounting: [
    "customers",
    "suppliers",
    "sales",
    "purchases",
    "invoices",
    "payments",
    "accounting",
  ],
};

// =====================================================
// HELPERS
// =====================================================

const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const createSearchRegex = (query) => {
  return new RegExp(escapeRegex(query), "i");
};

// =====================================================
// GET GLOBAL SEARCH RESULTS
// GET /api/search?q=
// =====================================================

const globalSearch = async (req, res, next) => {
  try {
    const query = req.query.q?.trim();

    if (!query || query.length < 2) {
      return res.status(200).json({
        success: true,
        results: [],
      });
    }

    const regex = createSearchRegex(query);

    const role = req.user?.role;
    const allowedModules = searchableModules[role] || [];

    const searches = [];

    // =================================================
    // PRODUCTS
    // =================================================

    if (allowedModules.includes("products")) {
      searches.push(
        Product.find({
          $or: [
            { sku: regex },
            { name: regex },
            { description: regex },
          ],
        })
          .select("_id sku name description status")
          .limit(5)
          .lean()
         .then((products) =>
  products.map((product) => ({
    type: "product",
    label: product.name,
    subtitle: `SKU: ${product.sku}`,
    path: `/products?search=${encodeURIComponent(
      product.sku
    )}`,
    status: product.status,
  }))
)
      );
    }

    // =================================================
    // CATEGORIES
    // =================================================

    if (allowedModules.includes("categories")) {
      searches.push(
        Category.find({
          $or: [
            { name: regex },
            { description: regex },
          ],
        })
          .select("_id name description status")
          .limit(5)
          .lean()
         .then((categories) =>
        categories.map((category) => ({
          type: "category",
          label: category.name,
          subtitle: "Category",
          path: `/categories?search=${encodeURIComponent(
            category.name
          )}`,
          status: category.status,
        }))
      )
      );
    }

    // =================================================
    // CUSTOMERS
    // =================================================

    if (allowedModules.includes("customers")) {
      searches.push(
        Customer.find({
          $or: [
            { customerCode: regex },
            { name: regex },
            { contactPerson: regex },
            { email: regex },
            { phone: regex },
          ],
        })
          .select("_id customerCode name contactPerson status")
          .limit(5)
          .lean()
       .then((customers) =>
  customers.map((customer) => ({
    type: "customer",
    label: customer.name,
    subtitle: customer.customerCode,
    path: `/customers?search=${encodeURIComponent(
      customer.customerCode
    )}`,
    status: customer.status,
  }))
)
      );
    }

    // =================================================
    // SUPPLIERS
    // =================================================

    if (allowedModules.includes("suppliers")) {
      searches.push(
        Supplier.find({
          $or: [
            { supplierCode: regex },
            { name: regex },
            { contactPerson: regex },
            { email: regex },
            { phone: regex },
          ],
        })
          .select("_id supplierCode name contactPerson status")
          .limit(5)
          .lean()
         .then((suppliers) =>
  suppliers.map((supplier) => ({
    type: "supplier",
    label: supplier.name,
    subtitle: supplier.supplierCode,
    path: `/suppliers?search=${encodeURIComponent(
      supplier.supplierCode
    )}`,
    status: supplier.status,
  }))
)
      );
    }

    // =================================================
    // SALES
    // =================================================

    if (allowedModules.includes("sales")) {
      searches.push(
        Sale.find({
          $or: [
            { salesNumber: regex },
            { status: regex },
          ],
        })
          .select("_id salesNumber status totalAmount saleDate")
          .limit(5)
          .lean()
          .then((sales) =>
        sales.map((sale) => ({
          type: "sale",
          label: sale.salesNumber,
          subtitle: `Sale • ${sale.status}`,
          path: `/sales?search=${encodeURIComponent(
            sale.salesNumber
          )}`,
          status: sale.status,
        }))
      )
      );
    }

    // =================================================
    // PURCHASES
    // =================================================

    if (allowedModules.includes("purchases")) {
      searches.push(
        Purchase.find({
          $or: [
            { purchaseNumber: regex },
            { status: regex },
          ],
        })
          .select("_id purchaseNumber status totalAmount purchaseDate")
          .limit(5)
          .lean()
         .then((purchases) =>
        purchases.map((purchase) => ({
          type: "purchase",
          label: purchase.purchaseNumber,
          subtitle: `Purchase • ${purchase.status}`,
          path: `/purchases?search=${encodeURIComponent(
            purchase.purchaseNumber
          )}`,
          status: purchase.status,
        }))
      )
      );
    }

    // =================================================
    // QUOTATIONS
    // =================================================

    if (allowedModules.includes("quotations")) {
      searches.push(
        Quotation.find({
          $or: [
            { quotationNumber: regex },
            { status: regex },
          ],
        })
          .select("_id quotationNumber status total quotationDate")
          .limit(5)
          .lean()
         .then((quotations) =>
  quotations.map((quotation) => ({
    type: "quotation",
    label: quotation.quotationNumber,
    subtitle: `Quotation • ${quotation.status}`,
    path: `/quotations?search=${encodeURIComponent(
      quotation.quotationNumber
    )}`,
    status: quotation.status,
  }))
)
      );
    }

    // =================================================
    // INVOICES
    // =================================================

    if (allowedModules.includes("invoices")) {
      searches.push(
        Invoice.find({
          $or: [
            { invoiceNumber: regex },
            { status: regex },
          ],
        })
          .select("_id invoiceNumber status totalAmount invoiceDate")
          .limit(5)
          .lean()
        .then((invoices) =>
  invoices.map((invoice) => ({
    type: "invoice",
    label: invoice.invoiceNumber,
    subtitle: `Invoice • ${invoice.status}`,
    path: `/invoices?search=${encodeURIComponent(
      invoice.invoiceNumber
    )}`,
    status: invoice.status,
  }))
)
      );
    }

    // =================================================
    // PAYMENTS
    // =================================================

    if (allowedModules.includes("payments")) {
      searches.push(
        Payment.find({
          $or: [
            { referenceNumber: regex },
            { paymentMethod: regex },
            { notes: regex },
          ],
        })
          .select(
            "_id referenceNumber paymentMethod amount paymentDate"
          )
          .limit(5)
          .lean()
          .then((payments) =>
  payments.map((payment) => ({
    type: "payment",
    label: payment.referenceNumber || "Payment",
    subtitle: `Payment • ${payment.paymentMethod}`,
    path: `/payments?search=${encodeURIComponent(
      payment.referenceNumber
    )}`,
  }))
)
      );
    }

    // =================================================
    // ACCOUNTING / CHART OF ACCOUNTS
    // =================================================

    if (allowedModules.includes("accounting")) {
      searches.push(
        ChartOfAccount.find({
          $or: [
            { accountCode: regex },
            { accountName: regex },
            { description: regex },
          ],
        })
          .select(
            "_id accountCode accountName accountType isActive"
          )
          .limit(5)
          .lean()
         .then((accounts) =>
  accounts.map((account) => ({
    type: "account",
    label: account.accountName,
    subtitle: `${account.accountCode} • ${account.accountType}`,
    path: `/accounting/chart-of-accounts?search=${encodeURIComponent(
      account.accountCode
    )}`,
    status: account.isActive ? "active" : "inactive",
  }))
)
      );
    }

    // =================================================
    // EXECUTE SEARCHES IN PARALLEL
    // =================================================

    const searchResults = await Promise.all(searches);

    const results = searchResults.flat();

    return res.status(200).json({
      success: true,
      count: results.length,
      results,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  globalSearch,
};