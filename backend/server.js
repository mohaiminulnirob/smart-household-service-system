import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import pool from "./config/db.js";
import { errorHandler } from "./middleware/errorHandler.js";

import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import ratingRoutes from "./routes/ratingRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import workerRoutes from "./routes/workerRoutes.js";

import mailer from "./utils/mailer.js";
import logger from "./utils/logger.js"; 
import requestLogger from "./middleware/requestLogger.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Log all API requests
app.use(requestLogger);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/requests", serviceRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/workers", workerRoutes);

// Root route
app.get("/", (req, res) => res.send({ success: true, message: "Backend is working" }));

// Place error handler LAST
app.use(errorHandler);

// Test DB Connection
const testDB = async () => {
  try {
    await pool.query("SELECT 1");
    logger.info("Database connected successfully");
  } catch (err) {
    logger.error("Database connection failed: " + err.message);
  }
};
testDB();

// Test SMTP transporter (optional)
const testMailer = async () => {
  try {
    await mailer.transporter.verify();
    logger.info("SMTP transporter ready");
  } catch (err) {
    logger.warn("SMTP transporter verification failed: " + err.message);
  }
};
testMailer();

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
