require("dotenv").config();

const mongoose = require("mongoose");

const dns = require("node:dns/promises");

dns.setServers(["1.1.1.1", "8.8.8.8"]);

const RESETTABLE_COLLECTIONS = [
  "users",
  "settings",

  // Master Data
  "products",
  "categories",
  "units",
  "customers",
  "suppliers",
  "supplierpricings",

  // Sales
  "quotations",
  "clientpos",
  "sales",
  "invoices",
  "payments",

  // Purchasing
  "supplierpos",
  "purchases",

  // Inventory
  "inventorymovements",

  // Accounting
  "chartofaccounts",
  "journalentries",
  "expenses",
  "commissions",

  // System
  "notifications",
  "documentcounters",
];

const resetDatabase = async () => {
  try {
    // ==========================================
    // SAFETY CHECKS
    // ==========================================

    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "Database reset is disabled while NODE_ENV=production."
      );
    }

    if (process.env.ALLOW_DB_RESET !== "true") {
      throw new Error(
        'Database reset is disabled. Set ALLOW_DB_RESET="true" in your local .env first.'
      );
    }

    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not configured.");
    }

    // ==========================================
    // CONNECT
    // ==========================================

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected.");
    console.log("Database:", mongoose.connection.name);

    // ==========================================
    // RESET COLLECTIONS
    // ==========================================

    console.log("\nStarting database reset...\n");

    for (const collectionName of RESETTABLE_COLLECTIONS) {
      try {
        const collection =
          mongoose.connection.db.collection(collectionName);

        const result = await collection.deleteMany({});

        console.log(
          `✓ ${collectionName}: ${result.deletedCount} document(s) deleted`
        );
      } catch (error) {
        // Collection may not exist yet.
        if (error.codeName === "NamespaceNotFound") {
          console.log(`- ${collectionName}: collection does not exist`);
        } else {
          throw error;
        }
      }
    }

    console.log("\n=================================");
    console.log("Database reset completed.");
    console.log("=================================\n");
  } catch (error) {
    console.error("\n❌ Database reset failed:");
    console.error(error.message);

    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

resetDatabase();