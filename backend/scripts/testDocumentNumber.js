const mongoose = require("mongoose");
const dotenv = require("dotenv");

const { generateDocumentNumber } = require("../services/documentNumberService");

dotenv.config();

const dns = require("node:dns/promises");

dns.setServers(["1.1.1.1", "8.8.8.8"]);


const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    const number1 = await generateDocumentNumber("quotation");
    console.log("Generated:", number1);

    const number2 = await generateDocumentNumber("quotation");
    console.log("Generated:", number2);

    const number3 = await generateDocumentNumber("quotation");
    console.log("Generated:", number3);

    await mongoose.disconnect();

    console.log("Test completed");
  } catch (error) {
    console.error("Test failed:", error);
    process.exit(1);
  }
};

run();