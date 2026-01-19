import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import interviewRoleGuard from "../middlewares/interviewRoleGuard.js";

import {
    createInterview,
    joinInterview,
    submitFeedback,
    saveEvaluation,
    getInterview,
    assignProblem,
    getPendingStudents,
    rejectStudent,
    addInterviewer,
    approveParticipant,
} from "../controllers/interviewController.js";

const router = express.Router();

/* CREATE INTERVIEW */
router.post("/create", protect, createInterview);

/* JOIN INTERVIEW */
router.post("/join", protect, joinInterview);

/* INTERVIEWER FEEDBACK (during interview) */
router.post(
    "/feedback/interviewer",
    protect,
    interviewRoleGuard("interviewer"),
    submitFeedback
);

/* FINAL EVALUATION (end interview) */
router.post(
    "/evaluation",
    protect,
    interviewRoleGuard("interviewer"),
    saveEvaluation
);
router.get("/:roomId", protect, getInterview);
// routes/interviewRoutes.js
router.post(
    "/assign-problem",
    protect,
    interviewRoleGuard("interviewer"),
    assignProblem
);
router.post("/approve-student", protect, approveParticipant);
router.get("/pending/:roomId", protect, getPendingStudents);
router.post("/reject-student", protect, rejectStudent);
router.post("/add-interviewer", protect, addInterviewer);







export default router;
