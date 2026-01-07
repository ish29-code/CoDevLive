import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { getMyProgress } from "../controllers/progressController.js";

const router = express.Router();

router.get("/me", protect, getMyProgress);

export default router;
