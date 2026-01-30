import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Video, VideoOff, Monitor } from "lucide-react";
import { socket } from "../../utils/socket";

const ICE = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

export default function VideoCall({ roomId }) {
    const localRef = useRef();
    const streamRef = useRef();
    const pcsRef = useRef({}); // 🔥 multiple peer connections

    const [remoteStreams, setRemoteStreams] = useState([]);
    const [micOn, setMicOn] = useState(true);
    const [camOn, setCamOn] = useState(true);
    const [fullScreen, setFullScreen] = useState(false);


    // ---------- INIT ----------
    useEffect(() => {
        let mounted = true;

        const init = async () => {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            if (!mounted) return;

            streamRef.current = stream;
            localRef.current.srcObject = stream;

            socket.emit("join-room", roomId);
            // Receive existing users
            /*socket.on("all-users", async (users) => 
                for (const userId of users) {
                    const pc = createPeer(userId);
                    pcsRef.current[userId] = pc;

                    stream.getTracks().forEach(track => pc.addTrack(track, stream));

                    const offer = await pc.createOffer();
                    await pc.setLocalDescription(offer);
                    socket.emit("webrtc-offer", { to: userId, offer });
                }
            });

            // When new user joins later
            socket.on("user-joined", async (userId) => {
                const pc = createPeer(userId);
                pcsRef.current[userId] = pc;
                stream.getTracks().forEach(track => pc.addTrack(track, stream));
            });*/

            // Receive existing users
            socket.on("all-users", async (users) => {
                for (const userId of users) {
                    const pc = createPeer(userId);
                    pcsRef.current[userId] = pc;

                    stream.getTracks().forEach(track => pc.addTrack(track, stream));

                    const offer = await pc.createOffer();
                    await pc.setLocalDescription(offer);
                    socket.emit("webrtc-offer", { to: userId, offer });
                }
            });

            // When new user joins later
            socket.on("user-joined", async (userId) => {
                const pc = createPeer(userId);
                pcsRef.current[userId] = pc;

                stream.getTracks().forEach(track => pc.addTrack(track, stream));

                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                socket.emit("webrtc-offer", { to: userId, offer });
            });


            // Receive offer
            socket.on("webrtc-offer", async ({ from, offer }) => {
                const pc = createPeer(from);
                pcsRef.current[from] = pc;

                stream.getTracks().forEach(track => pc.addTrack(track, stream));

                await pc.setRemoteDescription(offer);
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                socket.emit("webrtc-answer", { to: from, answer });
            });

            // Receive answer
            socket.on("webrtc-answer", async ({ from, answer }) => {
                await pcsRef.current[from].setRemoteDescription(answer);
            });

            // ICE
            socket.on("ice-candidate", ({ from, candidate }) => {
                pcsRef.current[from]?.addIceCandidate(candidate);
            });

            // User left
            socket.on("user-left", (userId) => {
                pcsRef.current[userId]?.close();
                delete pcsRef.current[userId];
                setRemoteStreams(prev => prev.filter(r => r.id !== userId));
            });
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

    // ---------- CREATE PEER ----------
    function createPeer(userId) {
        const pc = new RTCPeerConnection(ICE);

        pc.onicecandidate = (e) => {
            if (e.candidate) {
                socket.emit("ice-candidate", { to: userId, candidate: e.candidate });
            }
        };

        pc.ontrack = (e) => {
            setRemoteStreams(prev => {
                const exists = prev.find(p => p.id === userId);
                if (exists) return prev;
                return [...prev, { id: userId, stream: e.streams[0] }];
            });
        };

        return pc;
    }

    // ---------- CONTROLS ----------
    const toggleMic = () => {
        streamRef.current.getAudioTracks().forEach(t => t.enabled = !micOn);
        setMicOn(!micOn);
    };

    const toggleCam = () => {
        streamRef.current.getVideoTracks().forEach(t => t.enabled = !camOn);
        setCamOn(!camOn);
    };

    // ---------- UI ----------//
    return (
        <div className="relative">

            {/* === SMALL / NORMAL CONTAINER === */}
            <div
                className={`transition-all duration-300 ease-in-out
        ${fullScreen
                        ? "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center"
                        : "w-full"
                    }`}
            >
                {/* === POPUP CARD === */}
                <div
                    className={`transition-all duration-300 ease-in-out
          ${fullScreen
                            ? "w-[90vw] h-[80vh] bg-[#111] rounded-xl border border-white/10 shadow-xl flex flex-col"
                            : ""
                        }`}
                >

                    {/* === TOP BAR === */}
                    {fullScreen && (
                        <div className="flex justify-between items-center px-4 py-2 bg-[#1a1a1a] border-b border-white/10">
                            <span className="text-sm font-semibold text-white">
                                CoDevLive Interview
                            </span>

                            <button
                                onClick={() => setFullScreen(false)}
                                className="text-white text-lg hover:scale-110 transition"
                            >
                                ✕
                            </button>
                        </div>
                    )}

                    {/* === VIDEO GRID (always mounted) === */}
                    <div
                        className={`grid gap-2 place-items-center transition-all duration-300
            ${fullScreen
                                ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 p-4 flex-1 bg-black"
                                : "grid-cols-2 p-2"
                            }`}
                    >
                        {/* Local */}
                        <video
                            ref={localRef}
                            autoPlay
                            muted
                            playsInline
                            className={`object-cover rounded-md border border-white/10
              ${fullScreen ? "w-full h-40" : "w-24 h-16"}
            `}
                        />

                        {/* Remotes */}
                        {remoteStreams.map(r => (
                            <video
                                key={r.id}
                                autoPlay
                                playsInline
                                className={`object-cover rounded-md border border-white/10
                ${fullScreen ? "w-full h-40" : "w-24 h-16"}
              `}
                                ref={el => {
                                    if (el) el.srcObject = r.stream;
                                }}
                            />
                        ))}
                    </div>

                    {/* === BOTTOM CONTROLS === */}
                    <div
                        className={`flex justify-center gap-4 p-2 transition-all
            ${fullScreen ? "bg-[#1a1a1a] border-t border-white/10" : ""}
          `}
                    >
                        <button onClick={toggleMic} className="btn-outline p-2">
                            {micOn ? <Mic size={16} /> : <MicOff size={16} />}
                        </button>

                        <button onClick={toggleCam} className="btn-outline p-2">
                            {camOn ? <Video size={16} /> : <VideoOff size={16} />}
                        </button>

                        {/* === FULLSCREEN ICON === */}
                        {!fullScreen && (
                            <button
                                onClick={() => setFullScreen(true)}
                                className="btn-outline p-2"
                            >
                                <Monitor size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );


}
