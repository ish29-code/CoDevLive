import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { socket } from "../utils/socket";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthContext";

export default function InterviewWait() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        if (!roomId || !user?._id) return;

        socket.emit("join-room", roomId);

        // ✅ Single unified approval event
        const onParticipantApproved = ({ userId }) => {
            if (userId === user._id) {
                navigate(`/interview/${roomId}`);
            }
        };


        // ❌ Optional reject event (if host rejects)
        const onParticipantRejected = ({ userId }) => {
            if (userId === user._id) {
                alert("Host rejected your request");
                navigate(`/interview/lobby/${roomId}`);
            }
        };

        socket.on("participant-approved", onParticipantApproved);
        socket.on("participant-rejected", onParticipantRejected);

        return () => {
            socket.off("participant-approved", onParticipantApproved);
            socket.off("participant-rejected", onParticipantRejected);
        };
    }, [roomId, user, navigate]);


    return (
        <div className="relative">

            {/* Your existing full-screen loader */}
            <Loader />

            {/* Overlay text on top of loader */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--foreground)] pt-45">

                <h2 className="text-lg font-semibold text-[var(--accent)]">
                    ⏳ Waiting for interviewer approval...
                </h2>

                <p className="text-xs opacity-60 mt-2">
                    Please wait… Do not refresh this page.
                </p>

            </div>
        </div>
    );
}
