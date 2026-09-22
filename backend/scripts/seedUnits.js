require("dotenv").config();

const mongoose = require("mongoose");
const dns = require("node:dns/promises");

const Unit = require("../models/Unit");

dns.setServers(["1.1.1.1", "8.8.8.8"]);

const units = [
  {
    code: "PC",
    name: "Piece",
    description: "Individual piece or item",
  },
  {
    code: "PAIR",
    name: "Pair",
    description: "Two items treated as one unit",
  },
  {
    code: "SET",
    name: "Set",
    description: "Group of items sold or handled as one set",
  },
  {
    code: "KIT",
    name: "Kit",
    description: "Collection of items intended for a specific purpose",
  },
  {
    code: "DOZ",
    name: "Dozen",
    description: "Twelve pieces",
  },
  {
    code: "G",
    name: "Gram",
    description: "Unit of weight",
  },
  {
    code: "KG",
    name: "Kilogram",
    description: "Unit of weight",
  },
  {
    code: "TON",
    name: "Metric Ton",
    description: "One thousand kilograms",
  },
  {
    code: "MM",
    name: "Millimeter",
    description: "Unit of length",
  },
  {
    code: "CM",
    name: "Centimeter",
    description: "Unit of length",
  },
  {
    code: "M",
    name: "Meter",
    description: "Unit of length",
  },
  {
    code: "FT",
    name: "Foot",
    description: "Unit of length",
  },
  {
    code: "YD",
    name: "Yard",
    description: "Unit of length",
  },
  {
    code: "SQM",
    name: "Square Meter",
    description: "Unit of area",
  },
  {
    code: "SQFT",
    name: "Square Foot",
    description: "Unit of area",
  },
  {
    code: "ML",
    name: "Milliliter",
    description: "Unit of volume",
  },
  {
    code: "L",
    name: "Liter",
    description: "Unit of volume",
  },
  {
    code: "GAL",
    name: "Gallon",
    description: "Unit of volume",
  },
  {
    code: "CUFT",
    name: "Cubic Foot",
    description: "Unit of volume",
  },
  {
    code: "CUM",
    name: "Cubic Meter",
    description: "Unit of volume",
  },
  {
    code: "BOX",
    name: "Box",
    description: "Boxed quantity",
  },
  {
    code: "PACK",
    name: "Pack",
    description: "Packaged quantity",
  },
  {
    code: "PKG",
    name: "Package",
    description: "Packaged quantity",
  },
  {
    code: "BAG",
    name: "Bag",
    description: "Bagged quantity",
  },
  {
    code: "SACK",
    name: "Sack",
    description: "Sack quantity",
  },
  {
    code: "ROLL",
    name: "Roll",
    description: "Rolled material",
  },
  {
    code: "COIL",
    name: "Coil",
    description: "Coiled material",
  },
  {
    code: "REEL",
    name: "Reel",
    description: "Material supplied on a reel",
  },
  {
    code: "BUNDLE",
    name: "Bundle",
    description: "Grouped quantity",
  },
  {
    code: "CARTON",
    name: "Carton",
    description: "Carton quantity",
  },
  {
    code: "CASE",
    name: "Case",
    description: "Case quantity",
  },
  {
    code: "CRATE",
    name: "Crate",
    description: "Crated quantity",
  },
  {
    code: "PALLET",
    name: "Pallet",
    description: "Palletized quantity",
  },
  {
    code: "LOT",
    name: "Lot",
    description: "Grouped inventory or project quantity",
  },
  {
    code: "BAR",
    name: "Bar",
    description: "Bar-form material",
  },
];

const seedUnits = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not configured.");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected.");
    console.log("Database:", mongoose.connection.name);
    console.log("\nSeeding units...\n");

    let created = 0;
    let skipped = 0;

    for (const unit of units) {
      const result = await Unit.updateOne(
        { code: unit.code },
        {
          $setOnInsert: unit,
        },
        {
          upsert: true,
        }
      );

      if (result.upsertedCount === 1) {
        console.log(`✓ ${unit.code} - created`);
        created++;
      } else {
        console.log(`- ${unit.code} - already exists`);
        skipped++;
      }
    }

    console.log("\n=================================");
    console.log("Units seeding completed.");
    console.log("=================================");
    console.log(`Total:   ${units.length}`);
    console.log(`Created: ${created}`);
    console.log(`Skipped: ${skipped}`);
    console.log("=================================\n");
  } catch (error) {
    console.error("\n❌ Unit seed failed:");
    console.error(error.message);

    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedUnits();