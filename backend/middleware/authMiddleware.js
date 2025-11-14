import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { query } from "../config/db.js";
dotenv.config();

export const verifyToken = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: "No token provided" });

  const token = header.split(" ")[1];
  req.token = token;

  // check blacklist
  const [rows] = await query(
    "SELECT id FROM blacklisted_tokens WHERE token = ?",
    [token]
  );
  if (rows.length > 0)
    return res.status(403).json(error("Token is invalid (logged out)"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid or expired token" });
  }
};
