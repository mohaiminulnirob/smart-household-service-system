import express from "express";
import { getLandingStats } from "../controllers/statsController.js";

const router = express.Router();

router.get("/", getLandingStats);

export default router;
