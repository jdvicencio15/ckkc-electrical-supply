const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const userRoutes = require("./routes/userRoutes");

const customerRoutes = require("./routes/customerRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const supplierPricingRoutes = require("./routes/supplierPricingRoutes");
const quotationRoutes = require("./routes/quotationRoutes");
const clientPORoutes = require("./routes/clientPORoutes");
const supplierPORoutes = require("./routes/supplierPORoutes");
const purchaseRoutes = require("./routes/purchaseRoutes");
const saleRoutes = require("./routes/saleRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const commissionRoutes = require("./routes/commissionRoutes");
const inventoryMovementRoutes = require("./routes/inventoryMovementRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const accountingRoutes = require("./routes/accountingRoutes");
const reportRoutes = require("./routes/reportRoutes");
const settingsRoutes = require("./routes/settingsRoutes");

const searchRoutes = require("./routes/searchRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const errorMiddleware = require("./middleware/errorMiddleware");
const notFound = require("./middleware/notFound");
const { globalLimiter } = require("./middleware/rateLimitMiddleware");

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use(globalLimiter);

// Health Check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "CKKC Electrical Supply API running 🚀",
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/users", userRoutes);

app.use("/api/customers", customerRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/supplier-pricing", supplierPricingRoutes);
app.use("/api/quotations", quotationRoutes);
app.use("/api/client-pos", clientPORoutes);
app.use("/api/supplier-pos", supplierPORoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/commissions", commissionRoutes);
app.use("/api/inventory-movements", inventoryMovementRoutes);
app.use("/api/accounting", accountingRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/settings", settingsRoutes);

app.use("/api/search", searchRoutes);
app.use("/api/notifications", notificationRoutes);


// NOT FOUND
app.use(notFound);

// ERROR HANDLER (LAST)
app.use(errorMiddleware);

module.exports = app;