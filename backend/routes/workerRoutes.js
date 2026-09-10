import express from "express";
import { upload } from "../middleware/upload.js";
import {
  getWorkerProfile,
  updateWorkerProfile,
  getNearbyWorkers,
  getWorkerRatings,
  getWorkerRequests,
  updateAvailability,
  updateWorkerLocation
} from "../controllers/workerController.js";

import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Worker Profile
router.get("/profile/:id", verifyToken, getWorkerProfile);
router.put("/profile/update/:id", verifyToken, upload.single("profilePic"), updateWorkerProfile);

// Existing routes
router.get("/nearby", verifyToken, getNearbyWorkers);
router.get("/:id/ratings", verifyToken, getWorkerRatings);
router.get("/:id/requests", verifyToken, getWorkerRequests);
router.put("/:id/status", verifyToken, updateAvailability);
router.put("/:id/location", verifyToken, updateWorkerLocation);

export default router;
