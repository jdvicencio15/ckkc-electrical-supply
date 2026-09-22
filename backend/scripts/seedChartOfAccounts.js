require("dotenv").config();

const mongoose = require("mongoose");
const dns = require("node:dns/promises");

const User = require("../models/User");
const ChartOfAccount = require("../models/chartOfAccount");

dns.setServers(["1.1.1.1", "8.8.8.8"]);

const COA = [
  // ============================================================
  // ASSETS
  // ============================================================

  {
    code: "1000",
    name: "Assets",
    type: "asset",
    description: "Resources owned or controlled by the business.",
  },

  {
    code: "1100",
    name: "Cash and Cash Equivalents",
    type: "asset",
    parent: "1000",
    description: "Cash and cash-equivalent accounts.",
  },

  {
    code: "1110",
    name: "Cash on Hand",
    type: "asset",
    parent: "1100",
    description: "Physical cash held by the business.",
  },

  {
    code: "1120",
    name: "Bank Account",
    type: "asset",
    parent: "1100",
    description: "Business bank account balances.",
  },

  {
    code: "1130",
    name: "GCash / E-Wallet",
    type: "asset",
    parent: "1100",
    description: "GCash and other business e-wallet balances.",
  },

  {
    code: "1200",
    name: "Accounts Receivable",
    type: "asset",
    parent: "1000",
    description: "Amounts collectible from customers.",
  },

  {
    code: "1300",
    name: "Inventory",
    type: "asset",
    parent: "1000",
    description: "Inventory held for sale.",
  },

  {
    code: "1400",
    name: "Input VAT",
    type: "asset",
    parent: "1000",
    description: "Recoverable input value-added tax from purchases and expenses.",
  },

  // ============================================================
  // LIABILITIES
  // ============================================================

  {
    code: "2000",
    name: "Liabilities",
    type: "liability",
    description: "Obligations owed by the business.",
  },

  {
    code: "2100",
    name: "Accounts Payable",
    type: "liability",
    parent: "2000",
    description: "Amounts payable to suppliers.",
  },

  {
    code: "2200",
    name: "Output VAT",
    type: "liability",
    parent: "2000",
    description: "VAT collected from customers and payable to the government.",
  },

  {
    code: "2300",
    name: "Withholding Tax Payable",
    type: "liability",
    parent: "2000",
    description: "Withholding taxes collected or withheld and payable to the government.",
  },

  // ============================================================
  // EQUITY
  // ============================================================

  {
    code: "3000",
    name: "Equity",
    type: "equity",
    description: "Owner's interest in the business.",
  },

  {
    code: "3100",
    name: "Owner's Capital",
    type: "equity",
    parent: "3000",
    description: "Capital invested by the owner.",
  },

  {
    code: "3200",
    name: "Retained Earnings",
    type: "equity",
    parent: "3000",
    description: "Accumulated profits retained in the business.",
  },

  // ============================================================
  // REVENUE
  // ============================================================

  {
    code: "4000",
    name: "Revenue",
    type: "revenue",
    description: "Income generated from business operations.",
  },

  {
    code: "4100",
    name: "Sales Revenue",
    type: "revenue",
    parent: "4000",
    description: "Revenue generated from sales of products and materials.",
  },

  // ============================================================
  // EXPENSES
  // ============================================================

  {
    code: "5000",
    name: "Expenses",
    type: "expense",
    description: "Costs incurred in operating the business.",
  },

  {
    code: "5010",
    name: "Cost of Goods Sold",
    type: "expense",
    parent: "5000",
    description: "Cost of inventory sold to customers.",
  },

  {
    code: "5020",
    name: "Salaries and Wages",
    type: "expense",
    parent: "5000",
    description: "Employee salaries and wages.",
  },

  {
    code: "5030",
    name: "Rent Expense",
    type: "expense",
    parent: "5000",
    description: "Rent and lease expenses.",
  },

  {
    code: "5040",
    name: "Utilities Expense",
    type: "expense",
    parent: "5000",
    description: "Electricity, water, and other utility expenses.",
  },

  {
    code: "5050",
    name: "Transportation Expense",
    type: "expense",
    parent: "5000",
    description: "Transportation and delivery-related operating expenses.",
  },

  {
    code: "5060",
    name: "Office Supplies Expense",
    type: "expense",
    parent: "5000",
    description: "Office supplies and consumables.",
  },

  {
    code: "5070",
    name: "Communication Expense",
    type: "expense",
    parent: "5000",
    description: "Internet, telephone, and communication expenses.",
  },

  {
    code: "5080",
    name: "Bank Charges",
    type: "expense",
    parent: "5000",
    description: "Bank fees and transaction charges.",
  },

  {
    code: "5090",
    name: "Other Operating Expense",
    type: "expense",
    parent: "5000",
    description: "Other legitimate operating expenses.",
  },
];

const seedChartOfAccounts = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not configured.");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected.");
    console.log("Database:", mongoose.connection.name);

    // ============================================================
    // FIND OWNER
    // ============================================================

    const owner = await User.findOne({
      role: "owner",
      isActive: true,
    });

    if (!owner) {
      throw new Error(
        "Active owner account not found. Run seedOwner.js first."
      );
    }

    console.log("Owner:", owner.email);

    // ============================================================
    // PREVENT DUPLICATE SEED
    // ============================================================

    const existingAccounts = await ChartOfAccount.countDocuments();

    if (existingAccounts > 0) {
      console.log(
        `COA already contains ${existingAccounts} account(s). Seed skipped.`
      );
      return;
    }

    // ============================================================
    // CREATE ACCOUNTS
    // ============================================================

    const accountMap = new Map();

    // Create parents first
    const parentAccounts = COA.filter((account) => !account.parent);

    for (const accountData of parentAccounts) {
      const account = await ChartOfAccount.create({
        accountCode: accountData.code,
        accountName: accountData.name,
        accountType: accountData.type,
        parentAccount: null,
        description: accountData.description,
        isActive: true,
        createdBy: owner._id,
      });

      accountMap.set(accountData.code, account._id);

      console.log(
        `✓ ${account.accountCode} - ${account.accountName}`
      );
    }

    // Create child accounts
    const childAccounts = COA.filter((account) => account.parent);

    for (const accountData of childAccounts) {
      const parentId = accountMap.get(accountData.parent);

      if (!parentId) {
        throw new Error(
          `Parent account ${accountData.parent} not found for ${accountData.code}.`
        );
      }

      const account = await ChartOfAccount.create({
        accountCode: accountData.code,
        accountName: accountData.name,
        accountType: accountData.type,
        parentAccount: parentId,
        description: accountData.description,
        isActive: true,
        createdBy: owner._id,
      });

      accountMap.set(accountData.code, account._id);

      console.log(
        `  ✓ ${account.accountCode} - ${account.accountName}`
      );
    }

    // ============================================================
    // SUMMARY
    // ============================================================

    const totalAccounts = await ChartOfAccount.countDocuments();

    console.log("\n=================================");
    console.log("Chart of Accounts seeded.");
    console.log("=================================");
    console.log("Total accounts:", totalAccounts);
    console.log("Created by:", owner.email);
    console.log("=================================\n");
  } catch (error) {
    console.error("\n❌ COA seed failed:");
    console.error(error.message);

    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedChartOfAccounts();