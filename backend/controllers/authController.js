import bcrypt from "bcrypt";
import crypto from "crypto";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { query } from "../config/db.js";
import mailer from "../utils/mailer.js";
import logger from "../utils/logger.js";
import { error, success } from "../utils/responseHelper.js";

dotenv.config();

const SALT = 10;

const getBaseUrl = (req) => {
  const proto = req.headers["x-forwarded-proto"] || req.protocol;
  const host = req.headers["x-forwarded-host"] || req.get("host");
  return process.env.BASE_URL || `${proto}://${host}`;
};

// Register User
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json(error("All fields required"));

    const [existing] = await query("SELECT * FROM users WHERE email = ?", [email]);
    if (existing.length > 0)
      return res.status(400).json(error("User already exists"));

    const hashed = await bcrypt.hash(password, SALT);
    const [result] = await query(
      "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'user')",
      [name, email, hashed]
    );

    // create verification token
    const token = crypto.randomBytes(32).toString("hex");
    await query(
      "INSERT INTO tokens (user_id, token, type, expires_at) VALUES (?, ?, 'email_verify', DATE_ADD(NOW(), INTERVAL 1 DAY))",
      [result.insertId, token]
    );

    // send verification email (fire-and-forget to avoid blocking response)
    const verifyLink = `${getBaseUrl(req)}/api/auth/verify-email?token=${token}`;
    mailer.sendMail({
      to: email,
      subject: "Verify your FixMate account",
      html: `<p>Hello ${name},</p>
             <p>Thank you for registering. Please verify your email by clicking below:</p>
             <a href="${verifyLink}">Verify Email</a>
             <p>This link expires in 24 hours.</p>`,
    })
      .then(() => logger.info(`Verification email sent to user: ${email}`))
      .catch(err => logger.error("Failed to send verification email to user:", err.message));

    res.status(201).json(success("User registered successfully. Please verify your email."));
  } catch (err) {
    console.error("Register user error:", err);
    res.status(500).json(error(err.message));
  }
};

// Register Worker
export const registerWorker = async (req, res) => {
  try {
    const { name, email, phone, password, skill_category, location, latitude, longitude } = req.body;

    if (!name || !email || !password || !skill_category)
      return res.status(400).json(error("All fields required"));

    const [existing] = await query("SELECT * FROM workers WHERE email = ?", [email]);
    if (existing.length > 0)
      return res.status(400).json(error("Worker already exists"));

    const hashed = await bcrypt.hash(password, SALT);
    const [result] = await query(
      `INSERT INTO workers 
        (name, email, phone, password_hash, skill_category, location, availability, latitude, longitude)
       VALUES (?, ?, ?, ?, ?, ?, 'Offline', ?, ?)`,
      [name, email, phone || null, hashed, skill_category, location, latitude, longitude]
    );

    // verification token
    const token = crypto.randomBytes(32).toString("hex");
    await query(
      "INSERT INTO tokens (worker_id, token, type, expires_at) VALUES (?, ?, 'email_verify', DATE_ADD(NOW(), INTERVAL 1 DAY))",
      [result.insertId, token]
    );

    // send verification email (fire-and-forget to avoid blocking response)
    const verifyLink = `${getBaseUrl(req)}/api/auth/verify-email?token=${token}`;
    mailer.sendMail({
      to: email,
      subject: "Verify your FixMate worker account",
      html: `<p>Hello ${name},</p>
             <p>Thanks for registering as a worker. Please verify your email by clicking below:</p>
             <a href="${verifyLink}">Verify Email</a>
             <p>This link expires in 24 hours.</p>`,
    })
      .then(() => logger.info(`Verification email sent to worker: ${email}`))
      .catch(err => logger.error("Failed to send verification email to worker:", err.message));

    res.status(201).json(success("Worker registered successfully (Pending Admin Approval). Please verify your email."));
  } catch (err) {
    console.error("Register worker error:", err);
    res.status(500).json(error(err.message));
  }
};

// Verify email (user or worker)
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json(error("Token required"));

    const [rows] = await query(
      "SELECT * FROM tokens WHERE token = ? AND type = 'email_verify' AND expires_at > NOW()",
      [token]
    );
    if (!rows.length) return res.status(400).json(error("Invalid or expired token"));

    const tk = rows[0];
    if (tk.user_id) {
      await query("UPDATE users SET email_verified = 1 WHERE id = ?", [tk.user_id]);
    } else if (tk.worker_id) {
      await query("UPDATE workers SET email_verified = 1 WHERE id = ?", [tk.worker_id]);
    }

    // delete token after use
    await query("DELETE FROM tokens WHERE id = ?", [tk.id]);

    res.send("Email verified successfully. You can now log in.");
  } catch (err) {
    console.error("verifyEmail error:", err);
    res.status(500).json(error(err.message));
  }
};

// Login (role-based)
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role)
      return res.status(400).json(error("Email, password and role are required"));

    let account = null;

    if (role === "user" || role === "admin") {
    const [rows] = await query(
    "SELECT * FROM users WHERE email = ? AND role = ?",
    [email, role]
    );

     account = rows[0];

    if (!account) {
     return res.status(404).json(error("No account found with this email and role"));
    }
    }


    if (role === "worker") {
      const [rows] = await query("SELECT * FROM workers WHERE email = ?", [email]);
      account = rows[0];
      if (!account) return res.status(404).json(error("Worker not found"));
    }

    if (account.email_verified === 0)
      return res.status(403).json(error("Please verify your email before logging in."));

    const match = await bcrypt.compare(password, account.password_hash);
    if (!match) return res.status(400).json(error("Invalid credentials"));

    const token = jwt.sign(
      { id: account.id, role },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      ...success("Login successful"),
      token,
      user: { id: account.id, name: account.name, email: account.email, role },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json(error(err.message));
  }
};


// Change password (authenticated)
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword)
      return res.status(400).json(error("Old and new passwords are required"));

    // check in users
    const [users] = await query("SELECT * FROM users WHERE id = ?", [userId]);
    const [workers] = await query("SELECT * FROM workers WHERE id = ?", [userId]);

    const account = users[0] || workers[0];
    if (!account) return res.status(404).json(error("User not found"));

    const match = await bcrypt.compare(oldPassword, account.password_hash);
    if (!match) return res.status(400).json(error("Old password incorrect"));

    const hashed = await bcrypt.hash(newPassword, SALT);
    if (users[0]) {
      await query("UPDATE users SET password_hash = ? WHERE id = ?", [hashed, userId]);
    } else {
      await query("UPDATE workers SET password_hash = ? WHERE id = ?", [hashed, userId]);
    }

    res.json(success("Password changed successfully"));
  } catch (err) {
    console.error("changePassword error:", err);
    res.status(500).json(error(err.message));
  }
};

// Resend verification email (user or worker)
export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json(error("Email is required"));

    // Try both tables
    const [userRows] = await query("SELECT id, name, email_verified FROM users WHERE email = ?", [email]);
    const [workerRows] = await query("SELECT id, name, email_verified FROM workers WHERE email = ?", [email]);

    const account = userRows[0] || workerRows[0];
    const isUser = Boolean(userRows[0]);
    const isWorker = Boolean(workerRows[0]);

    if (!account) return res.status(404).json(error("Account not found"));
    if (account.email_verified === 1)
      return res.status(400).json(error("Email already verified"));

    // Delete any old tokens of this type
    if (isUser)
      await query("DELETE FROM tokens WHERE user_id = ? AND type = 'email_verify'", [account.id]);
    if (isWorker)
      await query("DELETE FROM tokens WHERE worker_id = ? AND type = 'email_verify'", [account.id]);

    // Create new token
    const token = crypto.randomBytes(32).toString("hex");
    await query(
    "INSERT INTO tokens (user_id, worker_id, token, type, expires_at) VALUES (?, ?, ?, 'email_verify', DATE_ADD(NOW(), INTERVAL 1 DAY))",
     [isUser ? account.id : null, isWorker ? account.id : null, token]
     );

    // Send mail (fire-and-forget to avoid blocking response)
    const verifyLink = `${getBaseUrl(req)}/api/auth/verify-email?token=${token}`;
    mailer.sendMail({
      to: email,
      subject: "Resend: Verify your FixMate account",
      html: `<p>Hello ${account.name},</p>
             <p>You requested a new verification link. Please verify by clicking below:</p>
             <a href="${verifyLink}">Verify Email</a>
             <p>This link expires in 24 hours.</p>`
    })
      .then(() => logger.info(`Resent verification email to: ${email}`))
      .catch(err => logger.error("Failed to resend verification email:", err.message));

    res.json(success("Verification email resent successfully"));
  } catch (err) {
    console.error("resendVerificationEmail error:", err);
    res.status(500).json(error(err.message));
  }
};

// Forgot password: send reset email
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json(error("Email is required"));

    // Try to find user or worker
    const [userRows] = await query("SELECT id, name, email_verified FROM users WHERE email = ?", [email]);
    const [workerRows] = await query("SELECT id, name, email_verified FROM workers WHERE email = ?", [email]);

    const account = userRows[0] || workerRows[0];
    const isUser = Boolean(userRows[0]);
    const isWorker = Boolean(workerRows[0]);

    if (!account) return res.status(404).json(error("Account not found"));
    if (account.email_verified === 0)
      return res.status(403).json(error("Please verify your email before resetting password."));

    // Remove old reset tokens
    if (isUser)
      await query("DELETE FROM tokens WHERE user_id = ? AND type = 'password_reset'", [account.id]);
    if (isWorker)
      await query("DELETE FROM tokens WHERE worker_id = ? AND type = 'password_reset'", [account.id]);

    // Create reset token
    const token = crypto.randomBytes(32).toString("hex");
    await query(
    "INSERT INTO tokens (user_id, worker_id, token, type, expires_at) VALUES (?, ?, ?, 'password_reset', DATE_ADD(NOW(), INTERVAL 30 MINUTE))",
    [isUser ? account.id : null, isWorker ? account.id : null, token]
    );


    // Send email (fire-and-forget to avoid blocking response)
    const resetLink = `${getBaseUrl(req)}/pages/auth/reset-password.html?token=${token}`;
    mailer.sendMail({
      to: email,
      subject: "Reset your FixMate password",
      html: `<p>Hello ${account.name},</p>
             <p>We received a request to reset your password. Click below to set a new one:</p>
             <a href="${resetLink}">Reset Password</a>
             <p>This link expires in 30 minutes. If you didn't request this, please ignore.</p>`
    })
      .then(() => logger.info(`Password reset email sent to: ${email}`))
      .catch(err => logger.error("Failed to send password reset email:", err.message));

    res.json(success("Password reset link sent to your email."));
  } catch (err) {
    console.error("forgotPassword error:", err);
    res.status(500).json(error(err.message));
  }
};

// Reset password
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword)
      return res.status(400).json(error("Token and new password are required"));

    // Find token
    const [rows] = await query(
      "SELECT * FROM tokens WHERE token = ? AND type = 'password_reset' AND expires_at > NOW()",
      [token]
    );
    if (!rows.length) return res.status(400).json(error("Invalid or expired token"));

    const tk = rows[0];
    const hashed = await bcrypt.hash(newPassword, 10);

    if (tk.user_id) {
      await query("UPDATE users SET password_hash = ? WHERE id = ?", [hashed, tk.user_id]);
    } else if (tk.worker_id) {
      await query("UPDATE workers SET password_hash = ? WHERE id = ?", [hashed, tk.worker_id]);
    }

    await query("DELETE FROM tokens WHERE id = ?", [tk.id]);

    res.json(success("Password reset successful. You can now log in."));
  } catch (err) {
    console.error("resetPassword error:", err);
    res.status(500).json(error(err.message));
  }
};

//logout controller using token blacklisting
export const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(400).json(error("Token required"));

    const decoded = jwt.decode(token);

    await query(
      "INSERT INTO blacklisted_tokens (token, expires_at) VALUES (?, FROM_UNIXTIME(?))",
      [token, decoded.exp]
    );

    res.json(success("Logged out successfully"));
  } catch (err) {
    console.error("logout error:", err);
    res.status(500).json(error(err.message));
  }
};
