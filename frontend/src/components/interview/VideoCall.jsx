// src/components/VideoCall.jsx
import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Video, VideoOff, Monitor } from "lucide-react";
import { socket } from "../../utils/socket";

export default function VideoCall({ roomId }) {
    const localRef = useRef(null);
    const remoteRef = useRef(null);
    const pcRef = useRef(null);
    const streamRef = useRef(null);

    const [micOn, setMicOn] = useState(true);
    const [camOn, setCamOn] = useState(true);
    const [screenOn, setScreenOn] = useState(false);
    const [status, setStatus] = useState("Connecting");

    /* ================= INIT ================= */
    useEffect(() => {
        let mounted = true;

        const init = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true,
                });

                if (!mounted) return;

                streamRef.current = stream;
                localRef.current.srcObject = stream;

                const pc = new RTCPeerConnection({
                    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
                });
                pcRef.current = pc;

                stream.getTracks().forEach((track) => pc.addTrack(track, stream));

                pc.ontrack = (e) => {
                    remoteRef.current.srcObject = e.streams[0];
                    setStatus("Live");
                };

                pc.onicecandidate = (e) => {
                    if (e.candidate) {
                        socket.emit("ice-candidate", { roomId, candidate: e.candidate });
                    }
                };

                pc.onconnectionstatechange = () => {
                    if (pc.connectionState === "connected") setStatus("Live");
                    if (pc.connectionState === "disconnected") setStatus("Disconnected");
                };

                /* ===== SOCKET ===== */
                socket.emit("join-room", roomId);

                socket.on("user-joined", async () => {
                    // 👇 AUTO CREATE OFFER
                    const offer = await pc.createOffer();
                    await pc.setLocalDescription(offer);
                    socket.emit("webrtc-offer", { roomId, offer });
                });

                socket.on("webrtc-offer", async (offer) => {
                    await pc.setRemoteDescription(offer);
                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);
                    socket.emit("webrtc-answer", { roomId, answer });
                });

                socket.on("webrtc-answer", async (answer) => {
                    await pc.setRemoteDescription(answer);
                });

                socket.on("ice-candidate", async (candidate) => {
                    await pc.addIceCandidate(candidate);
                });
            } catch (err) {
                console.error("VideoCall error:", err);
            }
        };

        init();

        return () => {
            mounted = false;
            socket.off("user-joined");
            socket.off("webrtc-offer");
            socket.off("webrtc-answer");
            socket.off("ice-candidate");

            pcRef.current?.close();
            streamRef.current?.getTracks().forEach((t) => t.stop());
        };
    }, [roomId]);

    /* ================= CONTROLS ================= */

    const toggleMic = () => {
        streamRef.current.getAudioTracks().forEach((t) => (t.enabled = !micOn));
        setMicOn(!micOn);
    };

    const toggleCam = () => {
        streamRef.current.getVideoTracks().forEach((t) => (t.enabled = !camOn));
        setCamOn(!camOn);
    };

    const toggleScreen = async () => {
        if (!screenOn) {
            const screen = await navigator.mediaDevices.getDisplayMedia({ video: true });
            const screenTrack = screen.getTracks()[0];
            const sender = pcRef.current
                .getSenders()
                .find((s) => s.track.kind === "video");

            sender.replaceTrack(screenTrack);
            screenTrack.onended = toggleScreen;
            setScreenOn(true);
        } else {
            const camTrack = streamRef.current.getVideoTracks()[0];
            const sender = pcRef.current
                .getSenders()
                .find((s) => s.track.kind === "video");

            sender.replaceTrack(camTrack);
            setScreenOn(false);
        }
    };

    /* ================= UI ================= */
    return (
        <div className="space-y-2">
            {/* STATUS */}
            <p className="text-xs text-center opacity-70">
                Status: <span className="font-semibold">{status}</span>
            </p>

            {/* VIDEOS */}
            <div className="flex justify-center gap-3">
                <video ref={localRef} autoPlay muted playsInline className="w-28 rounded-lg" />
                <video ref={remoteRef} autoPlay playsInline className="w-28 rounded-lg" />
            </div>

            {/* CONTROLS */}
            <div className="flex justify-center gap-3 mt-2">
                <button onClick={toggleMic} className="btn-outline p-2">
                    {micOn ? <Mic size={16} /> : <MicOff size={16} />}
                </button>

                <button onClick={toggleCam} className="btn-outline p-2">
                    {camOn ? <Video size={16} /> : <VideoOff size={16} />}
                </button>

                <button onClick={toggleScreen} className="btn-outline p-2">
                    <Monitor size={16} />
                </button>
            </div>
        </div>
    );
}
