import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Mic, MicOff, Video, VideoOff, Info } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import Loader from "../components/Loader";
import axios from "../utils/axios";

export default function InterviewLobby() {
    const { theme } = useTheme();
    const { roomId } = useParams();
    const navigate = useNavigate();

    const videoRef = useRef(null);
    const streamRef = useRef(null);

    const [mic, setMic] = useState(true);
    const [cam, setCam] = useState(true);
    const [loading, setLoading] = useState(true);

    /* ================= MEDIA PREVIEW ================= */
    useEffect(() => {
        navigator.mediaDevices
            .getUserMedia({ video: true, audio: true })
            .then((stream) => {
                streamRef.current = stream;
                videoRef.current.srcObject = stream;
                setLoading(false);
            })
            .catch(() => alert("Camera & Mic permission required"));

        return () => {
            streamRef.current?.getTracks().forEach((t) => t.stop());
        };
    }, []);

    const toggleMic = () => {
        streamRef.current.getAudioTracks().forEach((t) => (t.enabled = !mic));
        setMic(!mic);
    };

    const toggleCam = () => {
        streamRef.current.getVideoTracks().forEach((t) => (t.enabled = !cam));
        setCam(!cam);
    };

    /* ================= JOIN ================= */
    const joinInterview = async () => {
        setLoading(true);
        try {
            await axios.post("/interview/join", { roomId });
            navigate(`/interview/room/${roomId}`);
        } catch (e) {
            alert("Invalid interview link");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader />;

    /* ================= UI ================= */
    return (
        <div className="min-h-screen page-bg flex items-center justify-center text-[var(--foreground)]">
            <div className="grid grid-cols-2 gap-6 w-[880px]">

                {/* PREVIEW */}
                <div className="card-ui p-4 flex flex-col items-center gap-4">
                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        className="w-full h-[280px] bg-black rounded-lg object-cover"
                    />

                    <div className="flex gap-4">
                        <button onClick={toggleMic} className="btn-outline p-2">
                            {mic ? <Mic size={18} /> : <MicOff size={18} />}
                        </button>

                        <button onClick={toggleCam} className="btn-outline p-2">
                            {cam ? <Video size={18} /> : <VideoOff size={18} />}
                        </button>
                    </div>
                </div>

                {/* INFO */}
                <div className="card-ui p-6 flex flex-col justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-[var(--accent)] mb-3">
                            Ready to join interview?
                        </h2>

                        <ul className="text-sm opacity-80 space-y-2">
                            <li className="flex gap-2"><Info size={14} /> Stable internet</li>
                            <li className="flex gap-2"><Info size={14} /> Camera ON</li>
                            <li className="flex gap-2"><Info size={14} /> No tab switching</li>
                            <li className="flex gap-2"><Info size={14} /> Think aloud</li>
                        </ul>
                    </div>

                    <button onClick={joinInterview} className="btn-primary w-full mt-6">
                        Join Interview
                    </button>
                </div>
            </div>
        </div>
    );
}
