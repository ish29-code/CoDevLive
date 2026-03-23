/*import { io } from "socket.io-client";

// Always read MongoDB user stored after login
const mongoUser = JSON.parse(localStorage.getItem("user"));

export const socket = io("http://localhost:5000", {
    transports: ["websocket"],
    auth: {
        userId: mongoUser?._id   // ✅ ONLY MongoDB id
    }
});
*/

import { io } from "socket.io-client";

let socket;

export const connectSocket = (user) => {
    if (socket) {
        console.log("⚠️ Socket already connected", socket.id);
        return socket;
    }
    const userId = user?._id

    if (!userId) {
        console.log("⚠️ No user ID for socket");
        return;
    }

    socket = io("http://127.0.0.1:5000", {
        transports: ["websocket"],
        auth: {
            userId: userId   // ✅ ALWAYS VALID NOW
        }
    });

    return socket;
};

export const getSocket = () => socket;