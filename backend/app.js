import express from "express";
import cors from "cors";
import fileUpload from "express-fileupload"; // ✅ ADD THIS
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";

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

export default app;



