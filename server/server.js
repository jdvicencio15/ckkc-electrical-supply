const express = require("express");
const cors = require("cors");
require("dotenv").config();

const dns = require("node:dns/promises");

dns.setServers(["1.1.1.1", "8.8.8.8"]);


const connectDB = require("./config/db");

const app = express();

const PORT = process.env.PORT || 5000;


const authRoutes = require("./routes/authRoutes");



// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);


// Health Check Route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "MERN Starter Kit API is running 🚀",
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});