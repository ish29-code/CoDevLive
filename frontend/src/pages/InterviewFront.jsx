import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { socket } from "../utils/socket";
import { useTheme } from "../context/ThemeContext";
import {
    Mic,
    MicOff,
    Video,
    VideoOff,
    Users,
    Link as LinkIcon,
    Clock,
} from "lucide-react";

export default function InterviewFront() {
    const { theme } = useTheme();
    const { roomId } = useParams();
    const navigate = useNavigate();

    const videoRef = useRef(null);
    const streamRef = useRef(null);

    const [micOn, setMicOn] = useState(true);
    const [camOn, setCamOn] = useState(true);
    const [status, setStatus] = useState("waiting"); // waiting | requested | admitted
    const [participants, setParticipants] = useState([]);
    const [mediaError, setMediaError] = useState(null);

    const joinLink = `${window.location.origin}/interview-front/${roomId}`;

    /* ================= SAFE MEDIA PREVIEW ================= */
    useEffect(() => {
        async function initMedia() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true,
                });

                streamRef.current = stream;

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Media permission error:", err);
                setMediaError("Please allow camera & microphone access");
            }
        }

        initMedia();

        return () => {
            streamRef.current?.getTracks().forEach((track) => track.stop());
        };
    }, []);

    /* ================= SOCKET ================= */
    useEffect(() => {
        socket.emit("join-lobby", roomId);

        socket.on("lobby-users", setParticipants);
        socket.on("admitted", () => {
            setStatus("admitted");
            navigate(`/interview/${roomId}`);
        });

        return () => {
            socket.off("lobby-users");
            socket.off("admitted");
        };
    }, [roomId, navigate]);

    /* ================= CONTROLS ================= */
    const toggleMic = () => {
        streamRef.current?.getAudioTracks().forEach(
            (t) => (t.enabled = !micOn)
        );
        setMicOn(!micOn);
    };

    const toggleCam = () => {
        streamRef.current?.getVideoTracks().forEach(
            (t) => (t.enabled = !camOn)
        );
        setCamOn(!camOn);
    };

    const requestJoin = () => {
        socket.emit("request-join", roomId);
        setStatus("requested");
    };

    /* ================= UI ================= */
    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex items-center justify-center">
            <div className="w-full max-w-6xl grid grid-cols-2 gap-10 p-10 rounded-2xl bg-[var(--card)] shadow-[0_20px_60px_rgba(0,0,0,0.25)]">

                {/* ================= LEFT: VIDEO ================= */}
                <div className="space-y-5">
                    <div className="relative rounded-xl overflow-hidden bg-black">
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            className="w-full h-72 object-cover"
                        />

                        {/* STATUS */}
                        <div className="absolute top-3 left-3 text-xs px-3 py-1 rounded-full bg-black/60 text-white flex items-center gap-2">
                            <Clock size={12} />
                            {status === "waiting" && "Waiting"}
                            {status === "requested" && "Requested"}
                            {status === "admitted" && "Joining…"}
                        </div>
                    </div>

                    {/* ERROR */}
                    {mediaError && (
                        <p className="text-red-500 text-sm text-center">
                            {mediaError}
                        </p>
                    )}

                    {/* CONTROLS */}
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={toggleMic}
                            className={`p-3 rounded-full transition-all ${micOn
                                ? "bg-[var(--accent)]/15 text-[var(--accent)]"
                                : "bg-red-500/15 text-red-500"
                                } hover:scale-110`}
                        >
                            {micOn ? <Mic /> : <MicOff />}
                        </button>

                        <button
                            onClick={toggleCam}
                            className={`p-3 rounded-full transition-all ${camOn
                                ? "bg-[var(--accent)]/15 text-[var(--accent)]"
                                : "bg-red-500/15 text-red-500"
                                } hover:scale-110`}
                        >
                            {camOn ? <Video /> : <VideoOff />}
                        </button>
                    </div>
                </div>

                {/* ================= RIGHT: INFO ================= */}
                <div className="flex flex-col justify-between">
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-3xl font-bold">Interview Lobby</h2>
                            <p className="opacity-70 mt-1 text-sm">
                                Check your camera & microphone. The host will admit you shortly.
                            </p>
                        </div>

                        {/* JOIN LINK */}
                        <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg bg-[var(--background)]">
                            <span className="text-sm truncate opacity-80">{joinLink}</span>
                            <button
                                onClick={() => navigator.clipboard.writeText(joinLink)}
                                className="p-2 rounded-md hover:bg-[var(--accent)]/20 transition"
                            >
                                <LinkIcon size={16} />
                            </button>
                        </div>

                        {/* PARTICIPANTS */}
                        <div>
                            <div className="flex items-center gap-2 font-semibold mb-2">
                                <Users size={16} />
                                Waiting Room ({participants.length})
                            </div>
                            <ul className="text-sm opacity-75 space-y-1">
                                {participants.map((_, i) => (
                                    <li key={i}>• Candidate {i + 1}</li>
                                ))}
                                {participants.length === 0 && (
                                    <li className="opacity-50">No one else yet</li>
                                )}
                            </ul>
                        </div>
                    </div>

                    {/* ACTION */}
                    <button
                        onClick={requestJoin}
                        disabled={status !== "waiting"}
                        className={`mt-8 w-full py-3 rounded-xl font-semibold transition-all ${status === "waiting"
                            ? "bg-[var(--accent)] text-[var(--accent-foreground)] hover:scale-[1.02]"
                            : "bg-gray-400/30 text-gray-400 cursor-not-allowed"
                            }`}
                    >
                        {status === "requested"
                            ? "Waiting for Host Approval…"
                            : "Request to Join Interview"}
                    </button>
                </div>
            </div>
        </div>
    );
}
