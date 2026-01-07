import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Mic,
    MicOff,
    Video,
    VideoOff,
    Info,
    CheckCircle,
    ShieldAlert,
    Monitor,
    MonitorOff,
    AlertTriangle,
    User,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import Loader from "../components/Loader";
import axios from "../utils/axios";

export default function InterviewLobby() {
    const { theme } = useTheme();
    const { roomId } = useParams();
    const navigate = useNavigate();

    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const screenStreamRef = useRef(null);

    const [mic, setMic] = useState(false);
    const [cam, setCam] = useState(false);
    const [micStatus, setMicStatus] = useState(false);
    const [camStatus, setCamStatus] = useState(false);

    const [screen, setScreen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [ack, setAck] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);

    /* ================= MEDIA PREVIEW ================= */
    useEffect(() => {
        let timeoutId;

        const initMedia = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true,
                });

                streamRef.current = stream;

                const audioTrack = stream.getAudioTracks()[0];
                const videoTrack = stream.getVideoTracks()[0];

                // attach stream
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = () => {
                        videoRef.current.play().catch(() => { });
                    };
                }

                // ✅ SYNC STATES (THIS IS THE KEY)
                const micEnabled = !!audioTrack?.enabled;
                const camEnabled = !!videoTrack?.enabled;

                setMic(micEnabled);
                setCam(camEnabled);

                setMicStatus(micEnabled);
                setCamStatus(camEnabled);

                setLoading(false);
            } catch (err) {
                console.error(err);
                alert("Camera & Microphone permission required");
                setLoading(false);
            }
        };

        initMedia();

        timeoutId = setTimeout(() => setLoading(false), 3000);

        return () => {
            clearTimeout(timeoutId);
            streamRef.current?.getTracks().forEach((t) => t.stop());
            screenStreamRef.current?.getTracks().forEach((t) => t.stop());
        };
    }, []);

    /* ================= CONTROLS (FIXED) ================= */
    const toggleMic = () => {
        const track = streamRef.current?.getAudioTracks()[0];
        if (!track) return;

        track.enabled = !track.enabled;

        setMic(track.enabled);
        setMicStatus(track.enabled);
    };

    const toggleCam = () => {
        const track = streamRef.current?.getVideoTracks()[0];
        if (!track) return;

        track.enabled = !track.enabled;

        setCam(track.enabled);
        setCamStatus(track.enabled);
    };




    const toggleScreen = async () => {
        if (!screen) {
            try {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({
                    video: true,
                });

                screenStreamRef.current = screenStream;
                if (videoRef.current) {
                    videoRef.current.srcObject = screenStream;
                    videoRef.current.play().catch(() => { });
                }

                setScreen(true);

                screenStream.getVideoTracks()[0].onended = () => {
                    if (videoRef.current && streamRef.current) {
                        videoRef.current.srcObject = streamRef.current;
                        videoRef.current.play().catch(() => { });
                    }
                    setScreen(false);
                };
            } catch { }
        } else {
            screenStreamRef.current?.getTracks().forEach((t) => t.stop());
            screenStreamRef.current = null;

            if (videoRef.current && streamRef.current) {
                videoRef.current.srcObject = streamRef.current;
                videoRef.current.play().catch(() => { });
            }

            setScreen(false);
        }
    };

    /* ================= JOIN ================= */
    const canJoin = mic && cam && ack && selectedRole;

    const joinInterview = async () => {
        if (!canJoin || !roomId) return;

        setLoading(true);
        try {
            const res = await axios.post("/interview/join", {
                roomId,
                role: selectedRole,
            });

            // optional but good
            sessionStorage.setItem("interviewId", res.data.interviewId);
            sessionStorage.setItem("role", res.data.role);
            navigate(`/interview/${roomId}`);
        } catch (err) {
            alert(
                err?.response?.data?.message || "Invalid interview link"
            );
        } finally {
            setLoading(false);
        }
    };



    if (loading) return <Loader />;

    /* ================= UI (UNCHANGED) ================= */
    return (
        <div className="min-h-screen page-bg flex items-center justify-center text-[var(--foreground)]">
            <div className="grid grid-cols-3 gap-6 w-[1100px]">
                {/* PREVIEW */}
                <div className="card-ui p-4 col-span-1 flex flex-col gap-4">
                    <h3 className="font-semibold text-[var(--accent)]">
                        Camera / Screen Preview
                    </h3>

                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-[220px] bg-black rounded-lg object-cover"
                    />

                    <div className="flex justify-center gap-4">
                        <button onClick={toggleMic} className="btn-outline p-2">
                            {mic ? <Mic size={18} /> : <MicOff size={18} />}
                        </button>

                        <button onClick={toggleCam} className="btn-outline p-2">
                            {cam ? <Video size={18} /> : <VideoOff size={18} />}
                        </button>

                        <button onClick={toggleScreen} className="btn-outline p-2">
                            {screen ? <MonitorOff size={18} /> : <Monitor size={18} />}
                        </button>
                    </div>

                    <div className="text-xs opacity-80 space-y-1">
                        <p className="flex gap-2 items-center">
                            {camStatus ? (
                                <CheckCircle size={14} className="text-green-500" />
                            ) : (
                                <AlertTriangle size={14} className="text-red-500" />
                            )}
                            Camera {camStatus ? "ON" : "OFF"}
                        </p>

                        <p className="flex gap-2 items-center">
                            {micStatus ? (
                                <CheckCircle size={14} className="text-green-500" />
                            ) : (
                                <AlertTriangle size={14} className="text-red-500" />
                            )}
                            Microphone {micStatus ? "ON" : "OFF"}
                        </p>

                        <p className="flex gap-2 items-center">
                            <Info size={14} /> Screen share optional
                        </p>
                    </div>
                </div>

                {/* ================= INSTRUCTIONS ================= */}
                <div className="card-ui p-6 col-span-2 flex flex-col gap-4">

                    {/* ROLE SELECTION (ADDED) */}
                    <div className="space-y-2">
                        <h4 className="font-semibold flex items-center gap-2">
                            <User size={16} /> Choose your role
                        </h4>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setSelectedRole("interviewer")}
                                className={`btn-outline px-4 py-2 ${selectedRole === "interviewer"
                                    ? "ring-2 ring-[var(--accent)]"
                                    : ""
                                    }`}
                            >
                                Interviewer
                            </button>

                            <button
                                onClick={() => setSelectedRole("student")}
                                className={`btn-outline px-4 py-2 ${selectedRole === "student"
                                    ? "ring-2 ring-[var(--accent)]"
                                    : ""
                                    }`}
                            >
                                Student
                            </button>
                        </div>
                    </div>

                    <h2 className="text-xl font-semibold text-[var(--accent)]">
                        Interview Instructions
                    </h2>

                    <div className="text-sm opacity-80 space-y-3 leading-relaxed">
                        <p>
                            This is a <b>live technical interview</b>. Maintain professional
                            communication throughout the session.
                        </p>

                        <p>
                            Keep your camera and microphone enabled for the entire interview.
                        </p>

                        <p>
                            Clearly explain your approach, assumptions, and edge cases while
                            solving problems.
                        </p>

                        <p>
                            Screen sharing may be required during coding or explanation.
                        </p>

                        <p className="flex gap-2 items-start">
                            <ShieldAlert size={16} className="text-red-500 mt-1" />
                            <span>
                                <b>Anti-cheat policy:</b> Tab switching, external assistance,
                                recording tools, or copying code is strictly prohibited.
                            </span>
                        </p>
                    </div>

                    {/* CHECKLIST */}
                    <div className="bg-[var(--background)] border border-[var(--border)] rounded-lg p-4 space-y-2 text-sm">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={ack}
                                onChange={() => setAck(!ack)}
                            />
                            I have read and understood the interview instructions
                        </label>

                        {!selectedRole && (
                            <p className="text-red-500 text-xs">
                                • Please select a role
                            </p>
                        )}
                        {!mic && cam && (
                            <p className="text-red-500 text-xs">
                                • Please enable your microphone
                            </p>
                        )}
                        {mic && !cam && (
                            <p className="text-red-500 text-xs">
                                • Please enable your camera
                            </p>
                        )}
                        {!mic && !cam && (
                            <p className="text-red-500 text-xs font-medium">
                                • Please enable both camera and microphone
                            </p>
                        )}


                    </div>

                    <button
                        disabled={!canJoin}
                        onClick={joinInterview}
                        className={`btn-primary w-full mt-2 ${!canJoin ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                    >
                        Join Interview
                    </button>

                    <p className="text-xs opacity-60 text-center">
                        You cannot rejoin once the interview ends.
                    </p>
                </div>
            </div>
        </div>
    );
}
