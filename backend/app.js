import express from "express";
import cors from "cors";
import fileUpload from "express-fileupload"; // ✅ ADD THIS
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js"; // ✅ ADD THIS
import interviewRoutes from "./routes/interviewRoutes.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ FIXED: fileUpload is now defined
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/settings", settingsRoutes)
app.use("/api/interview", interviewRoutes);

export default app;



