import express from "express";
import { protect } from "../middlewares/authMiddleware.js";

import {
    upsertProfile,
    getMyProfile,
} from "../controllers/ProfileController.js";

const router = express.Router();

router.get("/me", protect, getMyProfile);
router.put("/me", protect, upsertProfile);

export default router;
