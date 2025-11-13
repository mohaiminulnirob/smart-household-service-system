import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { getAllWorkersLocations, getAllUsersLocations, updateWorkerLocation } from "../controllers/mapController.js";

const router = express.Router();

// User can see all available workers
router.get("/workers", verifyToken, getAllWorkersLocations);

// Worker can see all users/households
router.get("/users", verifyToken, getAllUsersLocations);

// Worker updates their live location
router.put("/workers/:workerId/location", verifyToken, updateWorkerLocation);

export default router;
