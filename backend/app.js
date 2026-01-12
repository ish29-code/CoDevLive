import express from "express";
import cors from "cors";
import fileUpload from "express-fileupload";

import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import interviewRoutes from "./routes/interviewRoutes.js";

const app = express();

/* ================= GLOBAL MIDDLEWARE ================= */

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

/* ================= SOCKET INJECTOR ================= */
/* This ensures req.io is available inside ALL controllers */
export const setIO = (io) => {
  app.use((req, res, next) => {
    req.io = io;
    next();
  });
};

/* ================= ROUTES ================= */

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/interview", interviewRoutes);

export default app;
