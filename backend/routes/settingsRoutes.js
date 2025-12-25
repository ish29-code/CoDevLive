import express from "express";
import {
    getSettings,
    updateSettings,
    setup2FA,
    verify2FA,
} from "../controllers/settingsController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getSettings);
router.put("/", protect, updateSettings);

router.post("/2fa/setup", protect, setup2FA);
router.post("/2fa/verify", protect, verify2FA);

export default router;
