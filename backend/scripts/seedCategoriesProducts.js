const mongoose = require("mongoose");
const dotenv = require("dotenv");
const dns = require("node:dns/promises");

const Category = require("../models/Category");
const Product = require("../models/Product");
const Unit = require("../models/Unit");

dotenv.config();

dns.setServers(["1.1.1.1", "8.8.8.8"]);

const categories = [
  {
    name: "Electrical Wires & Cables",
    description: "Electrical wires and cables for power and installation applications",
  },
  {
    name: "Conduits & Fittings",
    description: "Conduits, pipes, connectors, and fittings for electrical installations",
  },
  {
    name: "Electrical Devices",
    description: "Switches, outlets, and other electrical installation devices",
  },
  {
    name: "Circuit Protection",
    description: "Circuit breakers and protective electrical devices",
  },
  {
    name: "Lighting",
    description: "LED lamps, bulbs, and lighting fixtures",
  },
];

const products = [
  // ==========================================
  // Electrical Wires & Cables
  // ==========================================
  {
    sku: "WIRE-THHN-2.0",
    name: "THHN Copper Wire 2.0mm²",
    description: "Single-core copper THHN wire for electrical installations",
    category: "Electrical Wires & Cables",
    unitCode: "M",
    minimumStock: 100,
    productCost: 38.5,
  },
  {
    sku: "WIRE-THHN-3.5",
    name: "THHN Copper Wire 3.5mm²",
    description: "Single-core copper THHN wire for power circuits",
    category: "Electrical Wires & Cables",
    unitCode: "M",
    minimumStock: 100,
    productCost: 62.75,
  },
  {
    sku: "CABLE-2C-2.0",
    name: "2-Core Flat Cord 2.0mm²",
    description: "Flexible two-core electrical cable",
    category: "Electrical Wires & Cables",
    unitCode: "M",
    minimumStock: 50,
    productCost: 45.0,
  },

  // ==========================================
  // Conduits & Fittings
  // ==========================================
  {
    sku: "CONDUIT-PVC-20",
    name: "PVC Electrical Conduit 20mm",
    description: "PVC conduit for electrical wiring protection",
    category: "Conduits & Fittings",
    unitCode: "M",
    minimumStock: 50,
    productCost: 28.0,
  },
  {
    sku: "CONDUIT-PVC-25",
    name: "PVC Electrical Conduit 25mm",
    description: "PVC conduit for larger electrical wiring installations",
    category: "Conduits & Fittings",
    unitCode: "M",
    minimumStock: 50,
    productCost: 36.5,
  },
  {
    sku: "FITTING-PVC-20",
    name: "PVC Conduit Elbow 20mm",
    description: "20mm PVC elbow fitting for conduit installation",
    category: "Conduits & Fittings",
    unitCode: "PC",
    minimumStock: 20,
    productCost: 8.5,
  },

  // ==========================================
  // Electrical Devices
  // ==========================================
  {
    sku: "SWITCH-1G-10A",
    name: "1-Gang Light Switch 10A",
    description: "Single-gang wall-mounted light switch",
    category: "Electrical Devices",
    unitCode: "PC",
    minimumStock: 20,
    productCost: 45.0,
  },
  {
    sku: "OUTLET-2G-16A",
    name: "2-Gang Convenience Outlet 16A",
    description: "Two-gang electrical convenience outlet",
    category: "Electrical Devices",
    unitCode: "PC",
    minimumStock: 20,
    productCost: 85.0,
  },
  {
    sku: "OUTLET-UNIV-16A",
    name: "Universal Convenience Outlet 16A",
    description: "Universal wall-mounted electrical outlet",
    category: "Electrical Devices",
    unitCode: "PC",
    minimumStock: 20,
    productCost: 72.5,
  },

  // ==========================================
  // Circuit Protection
  // ==========================================
  {
    sku: "MCB-1P-20A",
    name: "Single Pole MCB 20A",
    description: "20A miniature circuit breaker for branch circuit protection",
    category: "Circuit Protection",
    unitCode: "PC",
    minimumStock: 10,
    productCost: 125.0,
  },
  {
    sku: "MCB-2P-32A",
    name: "Double Pole MCB 32A",
    description: "32A double-pole miniature circuit breaker",
    category: "Circuit Protection",
    unitCode: "PC",
    minimumStock: 10,
    productCost: 285.0,
  },
  {
    sku: "MCCB-2P-100A",
    name: "2-Pole MCCB 100A",
    description: "100A molded case circuit breaker for higher-load applications",
    category: "Circuit Protection",
    unitCode: "PC",
    minimumStock: 5,
    productCost: 2450.0,
  },

  // ==========================================
  // Lighting
  // ==========================================
  {
    sku: "LED-BULB-9W",
    name: "LED Bulb 9W",
    description: "Energy-efficient 9W LED bulb",
    category: "Lighting",
    unitCode: "PC",
    minimumStock: 20,
    productCost: 85.0,
  },
  {
    sku: "LED-BULB-12W",
    name: "LED Bulb 12W",
    description: "Energy-efficient 12W LED bulb",
    category: "Lighting",
    unitCode: "PC",
    minimumStock: 20,
    productCost: 105.0,
  },
  {
    sku: "LED-PANEL-18W",
    name: "LED Panel Light 18W",
    description: "18W recessed LED panel light",
    category: "Lighting",
    unitCode: "PC",
    minimumStock: 10,
    productCost: 280.0,
  },
];

const seedCategoriesAndProducts = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not configured.");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected.");
    console.log("Database:", mongoose.connection.name);

    // ==========================================
    // SEED CATEGORIES
    // ==========================================

    const categoryMap = {};

    for (const categoryData of categories) {
      let category = await Category.findOne({
        name: categoryData.name,
      });

      if (!category) {
        category = await Category.create(categoryData);
        console.log(`✓ Category created: ${category.name}`);
      } else {
        console.log(`- Category already exists: ${category.name}`);
      }

      categoryMap[category.name] = category._id;
    }

    // ==========================================
    // SEED PRODUCTS
    // ==========================================

    for (const productData of products) {
      const existingProduct = await Product.findOne({
        sku: productData.sku,
      });

      if (existingProduct) {
        console.log(`- Product already exists: ${productData.sku}`);
        continue;
      }

      const unit = await Unit.findOne({
        code: productData.unitCode,
      });

      if (!unit) {
        throw new Error(
          `Unit not found for ${productData.sku}: ${productData.unitCode}`
        );
      }

      const categoryId = categoryMap[productData.category];

      if (!categoryId) {
        throw new Error(
          `Category not found for product: ${productData.sku}`
        );
      }

      await Product.create({
        sku: productData.sku,
        name: productData.name,
        description: productData.description,
        categoryId,
        unitId: unit._id,

        // Legacy field during UOM migration
        unit: unit.code,

        minimumStock: productData.minimumStock,
        currentStock: 0,
        status: "active",
        productCost: productData.productCost,
      });

      console.log(`✓ Product created: ${productData.sku}`);
    }

    console.log("\n=================================");
    console.log("Category & Product seed completed.");
    console.log("=================================");
    console.log(`Categories: ${categories.length}`);
    console.log(`Products: ${products.length}`);
    console.log("=================================\n");
  } catch (error) {
    console.error("\n❌ Category/Product seed failed:");
    console.error(error.message);

    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedCategoriesAndProducts();