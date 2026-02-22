import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";

import app, { setIO } from "./app.js";
import connectDB from "./config/db.js";
import { setupSocket } from "./socket.js";

/* 🔥 Redis Adapter */
import { createAdapter } from "@socket.io/redis-adapter";
import { pubClient, subClient } from "./config/socketRedis.js";
import { subscribeExecution } from "./subscribers/executionSubscriber.js";
/* ================= ENV ================= */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, ".env");

const result = dotenv.config({ path: envPath });
if (result.error) {
  console.error("❌ dotenv error:", result.error);
} else {
  console.log("✅ dotenv loaded");
}

/* ================= DB ================= */

await connectDB();

/* ================= SERVER ================= */

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

/* ================= SOCKET ================= */

const io = setupSocket(server);

io.adapter(createAdapter(pubClient, subClient));

/* 🔥 Inject io into express so controllers get req.io */
subscribeExecution(io);
setIO(io);

/* ================= START ================= */

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});


