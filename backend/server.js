import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import pool from "./config/db.js";
import { errorHandler } from "./middleware/errorHandler.js";

import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import ratingRoutes from "./routes/ratingRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import workerRoutes from "./routes/workerRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";

import requestLogger from "./middleware/requestLogger.js";
import logger from "./utils/logger.js";
import mailer from "./utils/mailer.js";

dotenv.config();

const app = express();

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use(requestLogger);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/requests", serviceRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/workers", workerRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/users", userRoutes);

// Root API route
//app.get("/", (req, res) => res.send("FixMate Backend Running"));

// Serve Frontend
const frontendPath = path.join(__dirname, "..", "frontend");
app.use(express.static(frontendPath));

// Express 5 compatible catch-all
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});


// Error Handler (must be last)
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

// Test mail provider
const testMailer = async () => {
  try {
    await mailer.verify();
    logger.info("Mail provider ready");
  } catch (err) {
    logger.warn("Mail provider verification failed: " + err.message);
  }
};
testMailer();

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  logger.info(`Server running at http://localhost:${PORT}`)
);
