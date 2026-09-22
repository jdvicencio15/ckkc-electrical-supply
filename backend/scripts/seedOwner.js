require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dns = require("node:dns/promises");

const User = require("../models/User");

dns.setServers(["1.1.1.1", "8.8.8.8"]);

const seedOwner = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not configured.");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected.");
    console.log("Database:", mongoose.connection.name);

    const email = "admin.ckkc@gmail.com";
    const password = "dar12345";

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log(`User already exists: ${email}`);
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      firstName: "CKKC",
      lastName: "Owner",
      email,
      password: hashedPassword,
      role: "owner",
      isActive: true,
    });

    console.log("\n=================================");
    console.log("Owner account created.");
    console.log("=================================");
    console.log("Email:", user.email);
    console.log("Role:", user.role);
    console.log("Active:", user.isActive);
    console.log("Temporary password:", password);
    console.log("=================================\n");
  } catch (error) {
    console.error("\n❌ Owner seed failed:");
    console.error(error.message);

    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedOwner();