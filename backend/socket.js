// backend/socket
import { Server } from "socket.io";

export const setupSocket = (server) => {
    const io = new Server(server, {
        cors: { origin: "*" },
    });



    io.on("connection", (socket) => {
        console.log("🔌 User connected:", socket.id);

        socket.on("join-room", (roomId) => {
            socket.join(roomId);
            console.log(`👥 ${socket.id} joined room ${roomId}`);
        });

        // 🔥 REAL-TIME CODE SYNC
        socket.on("code-change", ({ roomId, code }) => {
            socket.to(roomId).emit("code-update", code);
        });

        // 🔥 WEBRTC SIGNALING
        socket.on("webrtc-offer", ({ roomId, offer }) => {
            socket.to(roomId).emit("webrtc-offer", offer);
        });

        socket.on("webrtc-answer", ({ roomId, answer }) => {
            socket.to(roomId).emit("webrtc-answer", answer);
        });

        socket.on("ice-candidate", ({ roomId, candidate }) => {
            socket.to(roomId).emit("ice-candidate", candidate);
        });

        socket.on("disconnect", () => {
            console.log("❌ User disconnected:", socket.id);
        });
    });
};
