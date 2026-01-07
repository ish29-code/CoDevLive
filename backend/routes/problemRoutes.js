import express from "express";
import { getAllProblems, getProblemById } from "../controllers/problemController.js";

const router = express.Router();

router.get("/", getAllProblems);
router.get("/:id", getProblemById);

export default router;
