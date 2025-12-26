import express from "express";
import { register, login, logout, getMe, deleteAccount } from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { firebaseLogin } from "../controllers/firebaseAuthController.js";



const router = express.Router();

// 🔹 Normal auth routes
router.post("/signup", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", protect, getMe);
router.post("/firebase-login", firebaseLogin);
router.delete("/delete", protect, deleteAccount);



// -----------------------------
// 🔹 OAuth with Google & GitHub
// -----------------------------
export default router;