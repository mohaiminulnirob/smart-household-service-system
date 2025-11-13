import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { query } from "../config/db.js";
import { responseSuccess, responseError, responseValidationError } from "../utils/responseHelper.js";

dotenv.config();
const SALT = 10;

// Register User
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, latitude, longitude } = req.body;

    if (!name || !email || !password || latitude == null || longitude == null)
      return responseValidationError(res, null, "All fields including coordinates are required");

    const [existing] = await query("SELECT * FROM users WHERE email = ?", [email]);
    if (existing.length > 0) return responseError(res, "User already exists", 400);

    const hashed = await bcrypt.hash(password, SALT);
    await query(
      "INSERT INTO users (name, email, password_hash, role, latitude, longitude) VALUES (?, ?, ?, 'user', ?, ?)",
      [name, email, hashed, latitude, longitude]
    );

    responseSuccess(res, null, "User registered successfully");
  } catch (err) {
    console.error("Register user error:", err);
    responseError(res, err.message);
  }
};

// Register Worker
export const registerWorker = async (req, res) => {
  try {
    const { name, email, password, skill_category, location, latitude, longitude } = req.body;

    if (!name || !email || !password || !skill_category || latitude == null || longitude == null)
      return responseValidationError(res, null, "All fields including coordinates are required");

    const [existing] = await query("SELECT * FROM workers WHERE email = ?", [email]);
    if (existing.length > 0) return responseError(res, "Worker already exists", 400);

    const hashed = await bcrypt.hash(password, SALT);
    await query(
      `INSERT INTO workers 
        (name, email, password_hash, skill_category, location, availability, latitude, longitude)
       VALUES (?, ?, ?, ?, ?, 'Offline', ?, ?)`,
      [name, email, hashed, skill_category, location, latitude, longitude]
    );

    responseSuccess(res, null, "Worker registered successfully (Pending Admin Approval)");
  } catch (err) {
    console.error("Register worker error:", err);
    responseError(res, err.message);
  }
};

// Login (user or worker)
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [userRows] = await query("SELECT * FROM users WHERE email = ?", [email]);
    const [workerRows] = await query("SELECT * FROM workers WHERE email = ?", [email]);

    const account = userRows[0] || workerRows[0];
    if (!account) return responseError(res, "Account not found", 404);

    const match = await bcrypt.compare(password, account.password_hash);
    if (!match) return responseError(res, "Invalid credentials", 400);

    const role = userRows.length > 0 ? account.role : "worker";
    const token = jwt.sign({ id: account.id, role }, process.env.JWT_SECRET, { expiresIn: "8h" });

    responseSuccess(res, {
      token,
      user: {
        id: account.id,
        name: account.name,
        email: account.email,
        role,
        latitude: account.latitude,
        longitude: account.longitude,
      },
    }, "Login successful");
  } catch (err) {
    console.error("Login error:", err);
    responseError(res, err.message);
  }
};
