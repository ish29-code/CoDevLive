import { Server } from "socket.io";
import { codeExecutionQueue } from "./queues/codeExecutionQueue.js";
import Interview from "./models/Interview.js";
import InterviewParticipant from "./models/InterviewParticipant.js";

let io;

// 🔹 Map userId -> socketId
export const userSockets = new Map();

export const setupSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            credentials: true
        },
    });

    // ✅ AUTH MIDDLEWARE (HERE ONLY)
    io.use((socket, next) => {
        const userId = socket.handshake.auth?.userId;

        if (!userId) {
            return next(new Error("Unauthorized"));
        }

        socket.userId = userId;
        next();
    });

    io.on("connection", (socket) => {

        // 🔹 get userId from frontend auth
        const userId = socket.handshake.auth?.userId;


        if (userId) {
            userSockets.set(userId.toString(), socket.id);
        }

        console.log("🔌 Connected:", socket.id, "USER:", userId);
        console.log("🧠 Stored userSockets:", [...userSockets.entries()]);

        // ================= JOIN ROOM =================
        /* socket.on("join-room", async (roomId) => {
 
             socket.join(roomId);
 
             console.log(`ROOM JOINED: ${socket.id} ${roomId}`);
 
             // show who is in the room
             const clients = io.sockets.adapter.rooms.get(roomId);
             console.log("ROOM MEMBERS:", clients ? [...clients] : []);
 
             // 🔹 send pending requests if interviewer reloads
             const interview = await Interview.findOne({ roomId });
 
             if (interview) {
 
                 const pending = await InterviewParticipant.find({
                     interviewId: interview._id,
                     status: "pending"
                 }).populate("userId", "fullName email");
 
                 pending.forEach(p => {
 
                     socket.emit("join-request", {
                         userId: p.userId._id,
                         name: p.userId.fullName || p.userId.email,
                         role: p.role
                     });
 
                 });
             }
         });*/
        socket.on("join-room", async (roomId) => {
            socket.join(roomId);

            console.log(`ROOM JOINED: ${socket.id} ${roomId}`);

            const interview = await Interview.findOne({ roomId });
            if (!interview) return;

            const pending = await InterviewParticipant.find({
                interviewId: interview._id,
                status: "pending"
            }).populate("userId", "fullName email");

            console.log("📨 Sending pending requests:", pending.length);

            pending.forEach(p => {
                socket.emit("join-request", {
                    userId: p.userId._id,
                    name: p.userId.fullName || p.userId.email,
                    role: p.role
                });
            });
        });

        // ================= WEBRTC SIGNALING =================

        socket.on("webrtc-offer", ({ to, offer }) => {
            io.to(to).emit("webrtc-offer", {
                from: socket.id,
                offer
            });
        });

        socket.on("webrtc-answer", ({ to, answer }) => {
            io.to(to).emit("webrtc-answer", {
                from: socket.id,
                answer
            });
        });

        socket.on("ice-candidate", ({ to, candidate }) => {
            io.to(to).emit("ice-candidate", {
                from: socket.id,
                candidate
            });
        });

        // ================= CODE EXECUTION =================

        socket.on("run-code", async ({ roomId, code, language }) => {

            const job = {
                roomId,
                code,
                language
            };

            await codeExecutionQueue.add("runCode", job);

            io.to(roomId).emit("execution-status", {
                status: "Queued"
            });

        });

        // ================= DISCONNECT =================

        socket.on("disconnect", () => {

            if (userId) {
                userSockets.delete(userId.toString());
            }

            console.log("❌ Disconnected:", socket.id);

        });

    });

    return io;
};

// 🔹 normal socket access
export const getIO = () => io;

// 🔹 get socketId of a specific user
export const getUserSocket = (userId) => {
    return userSockets.get(userId?.toString());
};