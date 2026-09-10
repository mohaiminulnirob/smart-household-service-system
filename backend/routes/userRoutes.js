import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/upload.js";
import {
  getUserProfile,
  updateUserProfile
} from "../controllers/userController.js";

const router = express.Router();

router.get("/profile/:id", verifyToken, getUserProfile);

router.put(
  "/profile/update/:id",
  verifyToken,
  upload.single("profilePic"),
  updateUserProfile
);

export default router;
