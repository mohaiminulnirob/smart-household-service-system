import express from "express";
import multer from "multer";
import {
  getUserActivity,
  getUserProfile,
  updateUserProfile
} from "../controllers/userController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Multer in-memory storage for LONGBLOB
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Get user profile
router.get("/profile/:id", verifyToken, getUserProfile);
router.get("/activity/:id",verifyToken, getUserActivity)
// Update profile + picture
router.put(
  "/profile/update/:id",
  verifyToken,
  upload.single("profilePic"),
  updateUserProfile
);

export default router;
