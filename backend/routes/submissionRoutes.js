import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { submitSolution } from "../controllers/submissionController.js";

const router = express.Router();

router.post("/", protect, submitSolution);

export default router;
