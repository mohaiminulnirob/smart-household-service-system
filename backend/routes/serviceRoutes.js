import express from "express";
import {
  acceptRequest,
  cancelRequest,
  completeRequest,
  createRequest,
  getUserRequests,
  getWorkerRequests,
  rejectRequest,
} from "../controllers/serviceController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// All require authentication
router.post("/", verifyToken, createRequest);

router.get("/user/:id", verifyToken, getUserRequests);
router.get("/worker/:id", verifyToken, getWorkerRequests);

router.put("/:id/complete", verifyToken, completeRequest);

router.put("/:id/accept", verifyToken, acceptRequest);
router.put("/:id/reject", verifyToken, rejectRequest);
router.put("/:id/cancel", verifyToken, cancelRequest);

export default router;
