import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import interviewRoleGuard from "../middlewares/interviewRoleGuard.js";

import {
    createInterview,
    joinInterview,
    submitFeedback,
    saveEvaluation
} from "../controllers/interviewController.js";

const router = express.Router();

router.post("/create", protect, createInterview);
router.post("/join", protect, joinInterview);
router.post(
    "/feedback",
    protect,
    interviewRoleGuard("interviewer"),
    submitFeedback
);
router.post("/feedback", protect, saveEvaluation);


export default router;
