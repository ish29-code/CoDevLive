import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import connectDB from "./config/db.js";

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: "http://localhost:5173", // vite default
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // <-- parse form data (optional)

// Routes
app.use("/api/auth", authRoutes);


export default app;
