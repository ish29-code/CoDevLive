import { useEffect, useRef, useState } from "react";
import {
    Mic,
    MicOff,
    Video,
    VideoOff,
    Maximize2,
    Minimize2
} from "lucide-react";

import { createPortal } from "react-dom";
import { socket } from "../../utils/socket";

const ICE = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

export default function VideoCall({ roomId }) {

    const localRef = useRef(null);
    const streamRef = useRef(null);
    const pcsRef = useRef({});

    const [remoteStreams, setRemoteStreams] = useState([]);
    const [micOn, setMicOn] = useState(true);
    const [camOn, setCamOn] = useState(true);
    const [fullScreen, setFullScreen] = useState(false); // ✅ LOCAL ONLY

    // ---------------- INIT ----------------
    useEffect(() => {
        let mounted = true;

        const init = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                });

                if (!mounted) return;

                streamRef.current = stream;
                if (localRef.current) localRef.current.srcObject = stream;

                socket.emit("join-room", roomId);

                socket.on("all-users", async (users) => {
                    for (const userId of users) {
                        const pc = createPeer(userId);
                        pcsRef.current[userId] = pc;

                        stream.getTracks().forEach(track =>
                            pc.addTrack(track, stream)
                        );

                        const offer = await pc.createOffer();
                        await pc.setLocalDescription(offer);

                        socket.emit("webrtc-offer", { to: userId, offer });
                    }
                });

                socket.on("user-joined", async (userId) => {
                    const pc = createPeer(userId);
                    pcsRef.current[userId] = pc;

                    stream.getTracks().forEach(track =>
                        pc.addTrack(track, stream)
                    );

                    const offer = await pc.createOffer();
                    await pc.setLocalDescription(offer);

                    socket.emit("webrtc-offer", { to: userId, offer });
                });

                socket.on("webrtc-offer", async ({ from, offer }) => {
                    const pc = createPeer(from);
                    pcsRef.current[from] = pc;

                    stream.getTracks().forEach(track =>
                        pc.addTrack(track, stream)
                    );

                    await pc.setRemoteDescription(offer);

                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);

                    socket.emit("webrtc-answer", { to: from, answer });
                });

                socket.on("webrtc-answer", async ({ from, answer }) => {
                    await pcsRef.current[from]?.setRemoteDescription(answer);
                });

                socket.on("ice-candidate", ({ from, candidate }) => {
                    pcsRef.current[from]?.addIceCandidate(candidate);
                });

                socket.on("user-left", (userId) => {
                    pcsRef.current[userId]?.close();
                    delete pcsRef.current[userId];

                    setRemoteStreams(prev =>
                        prev.filter(r => r.id !== userId)
                    );
                });

            } catch (err) {
                console.error("Media error:", err);
            }
        };

        init();

        return () => {
            mounted = false;

            socket.off("all-users");
            socket.off("user-joined");
            socket.off("webrtc-offer");
            socket.off("webrtc-answer");
            socket.off("ice-candidate");
            socket.off("user-left");

            Object.values(pcsRef.current).forEach(pc => pc.close());
            streamRef.current?.getTracks().forEach(t => t.stop());
        };
    }, [roomId]);

    // ---------------- PEER ----------------
    function createPeer(userId) {
        const pc = new RTCPeerConnection(ICE);

        pc.onicecandidate = (e) => {
            if (e.candidate) {
                socket.emit("ice-candidate", {
                    to: userId,
                    candidate: e.candidate
                });
            }
        };

        pc.ontrack = (e) => {
            setRemoteStreams(prev => {
                if (prev.find(p => p.id === userId)) return prev;
                return [...prev, { id: userId, stream: e.streams[0] }];
            });
        };

        return pc;
    }

    // ---------------- CONTROLS ----------------
    const toggleMic = () => {
        if (!streamRef.current) return;

        streamRef.current.getAudioTracks().forEach(t => {
            t.enabled = !micOn;
        });

        setMicOn(prev => !prev);
    };

    const toggleCam = () => {
        if (!streamRef.current) return;

        streamRef.current.getVideoTracks().forEach(t => {
            t.enabled = !camOn;
        });

        setCamOn(prev => !prev);
    };

    // ---------------- NORMAL UI ----------------
    const normalUI = (
        <div className="w-full">

            <div className="grid grid-cols-2 gap-2 p-2">

                <video
                    ref={localRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-32 h-24 rounded border border-white/10 object-cover"
                />

                {remoteStreams.map(r => (
                    <video
                        key={r.id}
                        autoPlay
                        playsInline
                        className="w-32 h-24 rounded border border-white/10 object-cover"
                        ref={el => {
                            if (el) el.srcObject = r.stream;
                        }}
                    />
                ))}

            </div>

            <div className="flex justify-center gap-4 p-2">
                <button onClick={toggleMic} className="btn-outline p-2">
                    {micOn ? <Mic size={18} /> : <MicOff size={18} />}
                </button>

                <button onClick={toggleCam} className="btn-outline p-2">
                    {camOn ? <Video size={18} /> : <VideoOff size={18} />}
                </button>

                <button
                    onClick={() => setFullScreen(true)}
                    className="btn-outline p-2"
                >
                    <Maximize2 size={18} />
                </button>
            </div>

        </div>
    );

    // ---------------- FULLSCREEN UI ----------------
    const fullScreenUI = (
        <div className="fixed inset-0 z-[9999] bg-black flex flex-col">

            <div className="flex justify-between items-center px-6 py-3 bg-[#111] border-b border-white/10">
                <span className="text-white font-semibold">
                    CoDevLive Interview
                </span>

                <button
                    onClick={() => setFullScreen(false)}
                    className="text-white"
                >
                    <Minimize2 size={20} />
                </button>
            </div>

            <div className="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-4">

                <video
                    ref={localRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-44 rounded border border-white/10 object-cover"
                />

                {remoteStreams.map(r => (
                    <video
                        key={r.id}
                        autoPlay
                        playsInline
                        className="w-full h-44 rounded border border-white/10 object-cover"
                        ref={el => {
                            if (el) el.srcObject = r.stream;
                        }}
                    />
                ))}

            </div>

            <div className="flex justify-center gap-6 p-4 bg-[#111] border-t border-white/10">
                <button onClick={toggleMic} className="btn-outline p-3">
                    {micOn ? <Mic size={20} /> : <MicOff size={20} />}
                </button>

                <button onClick={toggleCam} className="btn-outline p-3">
                    {camOn ? <Video size={20} /> : <VideoOff size={20} />}
                </button>

                <button
                    onClick={() => setFullScreen(false)}
                    className="btn-outline p-3"
                >
                    <Minimize2 size={20} />
                </button>
            </div>

        </div>
    );

    // ---------------- RETURN ----------------
    return (
        <>
            {!fullScreen && normalUI}

            {fullScreen &&
                createPortal(
                    fullScreenUI,
                    document.body
                )
            }
        </>
    );
}
