// socket.js
import { Server } from "socket.io";

let io;

export const setupSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            credentials: true
        },
    });

    io.on("connection", (socket) => {
        console.log("🔌 User connected:", socket.id);

        socket.on("join-room", (roomId) => {
            socket.join(roomId);
            console.log(`👥 ${socket.id} joined room ${roomId}`);
        });

        socket.on("code-change", ({ roomId, code }) => {
            socket.to(roomId).emit("code-update", code);
        });

        socket.on("webrtc-offer", ({ roomId, offer }) => {
            socket.to(roomId).emit("webrtc-offer", offer);
        });

        socket.on("webrtc-answer", ({ roomId, answer }) => {
            socket.to(roomId).emit("webrtc-answer", answer);
        });

        socket.on("ice-candidate", ({ roomId, candidate }) => {
            socket.to(roomId).emit("ice-candidate", candidate);
        });

        socket.on("toggle-hints", ({ roomId, show, count }) => {
            socket.to(roomId).emit("hints-visibility", { show, count });
        });


        socket.on("disconnect", () => {
            console.log("❌ User disconnected:", socket.id);
        });
    });

    return io;
};

export const getIO = () => io;

// backend/socket.js
