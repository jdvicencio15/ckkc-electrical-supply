const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const itemRoutes = require("./routes/itemRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const userRoutes = require("./routes/userRoutes");

const errorMiddleware = require("./middleware/errorMiddleware");
const notFound = require("./middleware/notFound");
const { globalLimiter } = require("./middleware/rateLimitMiddleware");
const helmet = require("helmet");

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use(globalLimiter);

// Health Check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "MERN Starter Kit API running 🚀"
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/users", userRoutes);

// NOT FOUND
app.use(notFound);

// ERROR HANDLER (LAST)
app.use(errorMiddleware);

module.exports = app;