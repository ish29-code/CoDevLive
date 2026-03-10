import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { submitCode } from "../controllers/submissionController.js";

const router = express.Router();

// POST /api/submissions
router.post("/", protect, submitCode);

export default router;
